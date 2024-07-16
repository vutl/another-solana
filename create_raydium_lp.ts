import {
    PublicKey,
    Connection,
    TransactionInstruction,
    SystemProgram,
    LAMPORTS_PER_SOL,
  } from '@solana/web3.js';
  import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
  import {
    Spl,
    Liquidity,
    MAINNET_PROGRAM_ID,
    SPL_ACCOUNT_LAYOUT,
    TokenAccount,
    TxVersion,
  } from '@raydium-io/raydium-sdk';
  import { Market } from '@project-serum/serum';
  import BN from 'bn.js';
  // import base58 from 'bs58';
  import { getDecimals } from './openbook_utils';
  import { getPoolKeys, getTokenAmount } from './remove_raydium_lp';
  import { FEE_WALLET, RAYDIUM_CREATE_AND_SNIPE_FEE, RAYDIUM_CREATE_AND_SNIPE_FEE_EXEMPT, RAYDIUM_CREATE_LP_FEE, RAYDIUM_CREATE_LP_FEE_EXEMPT, RAYDIUM_SWAP_FEE_EXEMPT, RAYDIUM_SWAP_LP_FEE } from './constant';
  
  export async function getMarketInfo(connection: Connection, marketID: PublicKey) {
    const market = await Market.load(connection, marketID, {}, MAINNET_PROGRAM_ID.OPENBOOK_MARKET);
    const marketInfo = {
      marketId: market.address,
      programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    };
    const baseMintInfo = {
      mint: market.baseMintAddress,
      decimals: await getDecimals(connection, market.baseMintAddress),
    };
    const quoteMintInfo = {
      mint: market.quoteMintAddress,
      decimals: await getDecimals(connection, market.quoteMintAddress),
    };
  
    const Bids = market.bidsAddress;
    const Asks = market.asksAddress;
    return {
      MarketInfo: marketInfo,
      BaseMintInfo: baseMintInfo,
      QuoteMintInfo: quoteMintInfo,
      Bids: Bids,
      Asks: Asks,
    };
  }
  
  export async function getOwnerInfo(
    connection: Connection,
    owner: PublicKey,
    baseMint: PublicKey,
    quoteMint: PublicKey
  ) {
    var baseMintBalance: BN;
    var quoteMintBalance: BN;
    var baseMintAccount: PublicKey;
    var quoteMintAccount: PublicKey;
    try {
      baseMintAccount = (await connection.getTokenAccountsByOwner(owner, { mint: baseMint })).value[0]
        .pubkey;
      baseMintBalance = new BN(
        (await connection.getTokenAccountBalance(baseMintAccount)).value.amount
      );
    } catch (error: any) {
      if(baseMint.toString() === 'So11111111111111111111111111111111111111112'){
        baseMintAccount = owner;
        baseMintBalance = new BN(await connection.getBalance(baseMintAccount));      
      }else{throw new Error('No Base-Token Account');};
    }
    try {
      quoteMintAccount = (await connection.getTokenAccountsByOwner(owner, { mint: quoteMint }))
        .value[0].pubkey;
      quoteMintBalance = new BN(
        (await connection.getTokenAccountBalance(quoteMintAccount)).value.amount
      );
    } catch (error: any) {
      if(quoteMint.toString() === 'So11111111111111111111111111111111111111112'){
        quoteMintAccount = owner;
        quoteMintBalance = new BN(await connection.getBalance(quoteMintAccount));
      }else{throw new Error('No Quote-Token Account');};
    }
    const ownerInfo = {
      feePayer: owner,
      wallet: owner,
      tokenAccounts: [],
    };
  
    return {
      OwnerInfo: ownerInfo,
      BaseMintBalance: baseMintBalance,
      QuoteMintBalance: quoteMintBalance,
      BaseMintAccount: baseMintAccount,
      QuoteMintAccount: quoteMintAccount,
    };
  }
  
  export async function getTokenAccounts(connection: Connection, owner: PublicKey) {
    let userTokenAccounts: TokenAccount[] = [];
    const TokenAccountsResp = await connection.getTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    });
    for (const { pubkey, account } of [...TokenAccountsResp.value]) {
      const rawResult = SPL_ACCOUNT_LAYOUT.decode(account.data);
      const { mint, amount } = rawResult;
      const associatedTokenAddress = Spl.getAssociatedTokenAccount({
        mint,
        owner,
        programId: account.owner,
      });
      userTokenAccounts.push({
        pubkey,
        accountInfo: rawResult,
        programId: account.owner,
      } as TokenAccount);
    }
    return userTokenAccounts;
  }
  
  export async function CreateLPInstructions(
    connection: Connection,
    owner: PublicKey,
    marketID: PublicKey,
    BaseAmount: BN,
    QuoteAmount: BN,
    StartTime: BN
  ) {
    const { MarketInfo, BaseMintInfo, QuoteMintInfo } = await getMarketInfo(connection, marketID);
    const OwnerTokenAccounts = await getTokenAccounts(connection, owner);
    //console.log(OwnerTokenAccounts);
    const { innerTransactions } = await Liquidity.makeCreatePoolV4InstructionV2Simple({
      connection,
      programId: MAINNET_PROGRAM_ID.AmmV4,
      marketInfo: {
        programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
        marketId: marketID,
      },
      associatedOnly: false,
      ownerInfo: {
        feePayer: owner,
        wallet: owner,
        tokenAccounts: OwnerTokenAccounts,
        useSOLBalance: true,
      },
      baseMintInfo: {
        mint: BaseMintInfo.mint,
        decimals: BaseMintInfo.decimals,
      },
      quoteMintInfo: {
        mint: QuoteMintInfo.mint,
        decimals: QuoteMintInfo.decimals,
      },
      startTime: StartTime,
      baseAmount: BaseAmount,
      quoteAmount: QuoteAmount,
  
      checkCreateATAOwner: true,
      makeTxVersion: TxVersion.V0,
      feeDestinationId: new PublicKey('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'),
    });
    const instructions : TransactionInstruction[] = [];
    for(const transaction of innerTransactions){
      for(const instruction of transaction.instructions){
        instructions.push(instruction);
      };
    };
    const raydiumCreateLPFee = RAYDIUM_CREATE_LP_FEE_EXEMPT.includes(owner.toString())? 0: RAYDIUM_CREATE_LP_FEE;
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: FEE_WALLET,
        lamports: raydiumCreateLPFee * LAMPORTS_PER_SOL,
      })
    );
    //console.log('IXes', innerTransactions[0]);
    return instructions;
  };
  
  export async function SwapBuyInstructions(
    connection: Connection,
    receiver: PublicKey,
    MarketId: PublicKey,
    Amount: number
  ) {
    const PoolKeys = await getPoolKeys(connection, MarketId);
    const UserTokenAccounts = await getTokenAccounts(connection, receiver);
    const minAmountOutB = await getTokenAmount(
            PoolKeys.baseMint,
            PoolKeys.baseDecimals,
            1,
        );
    const AmountInA = await getTokenAmount(
            PoolKeys.quoteMint,
            PoolKeys.quoteDecimals,
            Amount,
        );
    const {innerTransactions} = await Liquidity.makeSwapInstructionSimple(
      {
        connection,
        poolKeys: PoolKeys,
        userKeys: {
            tokenAccounts: UserTokenAccounts,
            owner: receiver,
            payer: receiver
        },
        fixedSide:'in',
        amountIn: AmountInA,
        amountOut: minAmountOutB, 
        makeTxVersion: TxVersion.V0,
      } 
    );
    const instructions : TransactionInstruction[] = [];
    for(const transaction of innerTransactions){
      for(const instruction of transaction.instructions){
        instructions.push(instruction);
      };
    };
    return instructions;
  };
  
  export async function SwapSellInstructions(
    connection: Connection,
    swapPayer: PublicKey,
    receiver: PublicKey,
    MarketId: PublicKey,
    Amount: number
  ) {
    const PoolKeys = await getPoolKeys(connection, MarketId);
    const UserTokenAccounts = await getTokenAccounts(connection, receiver);
    const AmountInA = await getTokenAmount(
            PoolKeys.baseMint,
            PoolKeys.baseDecimals,
            Amount,
        );
    const minAmountOutB = await getTokenAmount(
            PoolKeys.quoteMint,
            PoolKeys.quoteDecimals,
            0,
        );
      // Swap fixedSide: In
    const {innerTransactions} = await Liquidity.makeSwapInstructionSimple(
      {
        connection,
        poolKeys: PoolKeys,
        userKeys: {
            tokenAccounts: UserTokenAccounts,
            owner: receiver,
            payer: swapPayer
        },
        fixedSide:'in',
        amountIn: AmountInA,
        amountOut: minAmountOutB, 
        makeTxVersion: TxVersion.V0,
      } 
    );
    const instructions : TransactionInstruction[] = [];
    for(const transaction of innerTransactions){
      for(const instruction of transaction.instructions){
        instructions.push(instruction);
      };
    };
    const raydiumSwapFee = RAYDIUM_SWAP_FEE_EXEMPT.includes(swapPayer.toString())? 0: RAYDIUM_SWAP_LP_FEE;
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: swapPayer,
        toPubkey: FEE_WALLET,
        lamports: raydiumSwapFee * LAMPORTS_PER_SOL,
      })
    );
    return instructions;
  };
  export function CreateAndSnipeFeeInstructions(
    Payer: PublicKey,
  ) {
    const instructions : TransactionInstruction[] = [];
    const CreateAndSnipeFee = RAYDIUM_CREATE_AND_SNIPE_FEE_EXEMPT.includes(Payer.toString())? 0: RAYDIUM_CREATE_AND_SNIPE_FEE;
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: Payer,
        toPubkey: FEE_WALLET,
        lamports: CreateAndSnipeFee * LAMPORTS_PER_SOL,
      })
    );
    return instructions;
  };
  // async function CreatLP(
  //     connection: Connection,
  //     owner: Keypair,
  //     marketid: PublicKey,
  //     baseAmount: number,
  //     quoteAmount: number,
  //     startTime: number
  // ) {
  //     const {
  //         MarketInfo,
  //         BaseMintInfo,
  //         QuoteMintInfo
  //     } = await getMarketInfo(connection, marketid);
  //     const BaseAmount = baseAmount * (10 **BaseMintInfo.decimals);
  //     const QuoteAmount = quoteAmount * (10 **QuoteMintInfo.decimals);
  //     const StartTime = Math.round(Date.now()/1000) + startTime;
  //     const createLPIX = await CreateLPInstructions(
  //         connection,
  //         owner.publicKey,
  //         marketid,
  //         new BN(BaseAmount),
  //         new BN(QuoteAmount),
  //         new BN(StartTime)
  //     );
  //     const latestBlockhash = await connection.getLatestBlockhash();
  //     let createLPTX = new Transaction(latestBlockhash);
  //     createLPTX.add(...createLPIX);
  //     const txid = await sendAndConfirmTransaction(connection,createLPTX,[owner]);
  //     console.log(txid);
  // };
  
  // const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ac64b741-8899-413d-84e7-4d05dee75e9b");
  // const OWNER = Keypair.fromSecretKey(base58.decode('4qfRSfcfwsh5eUkgBykzxH2vApF7YbJna9cFCU1fqc9i781hHMDN8mgraApnxt8TcKH8nSBuoa3PyRcsKxzB8jzo'));
  // const MARKETID = new PublicKey('8JDeT98hkk2MujMsmm2d2DYSSfwmGqf6Eoqt78fn8i2s');
  
  // CreatLP(connection,OWNER,MARKETID, 1_000_000, 0.1, 3000);
  