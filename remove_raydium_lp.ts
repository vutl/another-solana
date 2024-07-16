import {
    PublicKey,
    Connection,
    TransactionInstruction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    } from '@solana/web3.js';
  import {TOKEN_PROGRAM_ID} from '@solana/spl-token';
  import {
    Liquidity,
    MAINNET_PROGRAM_ID,
    LiquidityPoolKeysV4,
    TokenAmount,    
    Token,
    TxVersion,
    SPL_ACCOUNT_LAYOUT
  } from '@raydium-io/raydium-sdk'
  import {Market} from '@project-serum/serum';
  import BN from 'bn.js';
  // import * as bs58 from 'bs58';
  // import { getDecimals } from './openbook_utils';
  import { getMarketInfo, getTokenAccounts } from './create_raydium_lp';
  import { UNITPRICE_FOR_REVOME_RAYDIUM_LP, UNITPRICE, RAYDIUM_REMOVE_LP_FEE_EXEMPT, RAYDIUM_REMOVE_LP_FEE, FEE_WALLET } from './constant';
  
  export async function getTokenAccount(
    connection: Connection,
    owner: PublicKey,
    mint: PublicKey
    ) {
    const TokenAccountsResp = await connection.getTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID, mint: mint });
    const TokenAccountData = TokenAccountsResp.value[0].account.data;
    const rawResult = SPL_ACCOUNT_LAYOUT.decode(TokenAccountData);
    return rawResult;
  };
  
  export async function getPoolKeys(
    connection: Connection,
    MarketId:PublicKey
  ) {
    const {
        MarketInfo,
        BaseMintInfo,
        QuoteMintInfo,
        Bids,
        Asks,
    } = await getMarketInfo(connection, MarketId);
    const AssociatedPoolKeys = Liquidity.getAssociatedPoolKeys(
        {
            version: 4,
            marketVersion: 3,
            marketId: MarketId,
            baseMint: BaseMintInfo.mint,
            quoteMint: QuoteMintInfo.mint,
            baseDecimals: BaseMintInfo.decimals,
            quoteDecimals: QuoteMintInfo.decimals,
            programId: MAINNET_PROGRAM_ID.AmmV4,
            marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET
        }
    );
  
    const OPENBOOK_MARKET_ACCOUNT_LAYOUT = await Market.getLayout(MAINNET_PROGRAM_ID.OPENBOOK_MARKET);
    const _mkinf = await connection.getAccountInfo(MarketId);
    const MKinfo = OPENBOOK_MARKET_ACCOUNT_LAYOUT.decode(_mkinf?.data);
  
    let poolKeys: LiquidityPoolKeysV4 = {
        id: AssociatedPoolKeys.id,
        authority: AssociatedPoolKeys.authority,
        openOrders: AssociatedPoolKeys.openOrders,
        targetOrders: AssociatedPoolKeys.targetOrders,
        baseVault: AssociatedPoolKeys.baseVault,
        quoteVault: AssociatedPoolKeys.quoteVault,
        lpVault: AssociatedPoolKeys.lpVault,
        baseMint: AssociatedPoolKeys.baseMint,
        quoteMint: AssociatedPoolKeys.quoteMint,
        lpMint: AssociatedPoolKeys.lpMint,
        baseDecimals: AssociatedPoolKeys.baseDecimals,
        quoteDecimals: AssociatedPoolKeys.quoteDecimals,
        lpDecimals: AssociatedPoolKeys.lpDecimals,
        withdrawQueue: AssociatedPoolKeys.withdrawQueue,
        programId: AssociatedPoolKeys.programId,
        version: AssociatedPoolKeys.version,
        marketVersion: AssociatedPoolKeys.marketVersion,
        marketProgramId: AssociatedPoolKeys.marketProgramId,
        marketId: AssociatedPoolKeys.marketId,
        marketAuthority: AssociatedPoolKeys.marketAuthority,    
        marketBaseVault: MKinfo.baseVault,
        marketQuoteVault: MKinfo.quoteVault,
        marketBids: Bids,
        marketAsks: Asks,
        marketEventQueue: MKinfo.eventQueue,
        lookupTableAccount: AssociatedPoolKeys.lookupTableAccount,
    };
    //console.log('PK',poolKeys);
    // console.log('MK',MKinfo);
    return poolKeys;
  };
  
  // export async function getUserKeys(
  //     connection: Connection,
  //     User:PublicKey
  //     ) {
  //     let userKeys : LiquidityUserKeys = {
  //         owner: User,
  //         baseTokenAccount: new PublicKey(''),
  //         quoteTokenAccount: new PublicKey(''),
  //         lpTokenAccount: new PublicKey(''),
  //     };
  //     return userKeys;
  // }
  
  export async function getTokenAmount(mint: PublicKey, decimals: number, amount: number) {
    const TokenAccount = new Token(
        TOKEN_PROGRAM_ID,
        mint,
        decimals,
        );
    const tokenAmount = new TokenAmount(TokenAccount, new BN(amount));
    return tokenAmount;
  }
  export async function RemoveLPInstructions(
    connection: Connection,
    owner: PublicKey,
    MarketId: PublicKey,
    Amount: number
  ) {
    const PoolKeys = await getPoolKeys(connection, MarketId);
    const UserTokenAccounts = await getTokenAccounts(connection, owner);
    const AmountIn = await getTokenAmount(
            PoolKeys.lpMint,
            PoolKeys.lpDecimals,
            Amount,
        );
    // console.log(AmountIn)
    const {innerTransactions} = await Liquidity.makeRemoveLiquidityInstructionSimple(
        {
            connection,
            poolKeys: PoolKeys,
            userKeys: {
                tokenAccounts: UserTokenAccounts,
                owner: owner,
            },
            amountIn: AmountIn,
            makeTxVersion: TxVersion.V0,
            computeBudgetConfig: {microLamports: UNITPRICE_FOR_REVOME_RAYDIUM_LP, units: 100_000}
        }
    );
    const ixes : TransactionInstruction[] = [];
    for(const transaction of innerTransactions){
      for(const instruction of transaction.instructions){
        ixes.push(instruction);
      };
    };
    const raydiumRemoveLPFee = RAYDIUM_REMOVE_LP_FEE_EXEMPT.includes(owner.toString())? 0 : RAYDIUM_REMOVE_LP_FEE;
    ixes.push(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: FEE_WALLET,
        lamports: raydiumRemoveLPFee * LAMPORTS_PER_SOL,
      })
    );
    return ixes;
  };
  export async function AddLPInstructions(
    connection: Connection,
    owner: PublicKey,
    MarketId: PublicKey,
    Amount: number
  ) {
    const PoolKeys = await getPoolKeys(connection, MarketId);
    const UserTokenAccounts = await getTokenAccounts(connection, owner);
    const AmountInA = await getTokenAmount(
            PoolKeys.baseMint,
            PoolKeys.baseDecimals,
            Amount,
        );
    const AmountInB = await getTokenAmount(
            PoolKeys.quoteMint,
            PoolKeys.quoteDecimals,
            Amount,
        );
    // console.log(AmountInA)
    const {innerTransactions} = await Liquidity.makeAddLiquidityInstructionSimple(
        {
            connection,
            poolKeys: PoolKeys,
            userKeys: {
                tokenAccounts: UserTokenAccounts,
                owner: owner,
                payer: owner
            },
            amountInA: AmountInA,
            amountInB: AmountInB,
            fixedSide: 'a',
            makeTxVersion: TxVersion.LEGACY,
            computeBudgetConfig: {microLamports: UNITPRICE, units: 100000}
        }
    );
    // Swap fixedSide: In
    // const {} = await Liquidity.makeSwapInstructionSimple(
    //   {
    //     connection,
    //     poolKeys: PoolKeys,
    //     userKeys: {
    //         tokenAccounts: UserTokenAccounts,
    //         owner: owner,
    //     },
    //     fixedSide:'in',
    //     amountIn: AmountInA,
    //     amountOut: AmountInB, 
    //     makeTxVersion: TxVersion.V0,
    //     computeBudgetConfig: {microLamports: UNITPRICE, units: 100000}
    // } 
    // );
    return innerTransactions;
  };
  
  // export async function test() {
  //     const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=ac64b741-8899-413d-84e7-4d05dee75e9b');
  //     const OWNER = Keypair.fromSecretKey(bs58.decode('4qfRSfcfwsh5eUkgBykzxH2vApF7YbJna9cFCU1fqc9i781hHMDN8mgraApnxt8TcKH8nSBuoa3PyRcsKxzB8jzo'));
  //     const AMOUNT = 1;
  //     const MarketID = new PublicKey('eUPsWY8sctSyDbk1ACSnn8huwxov68m56o8PRG7TxjW');
  //     const IXes = await RemoveLPInstructions(
  //         connection,
  //         OWNER.publicKey,
  //         MarketID,
  //         AMOUNT
  //     );
  
  //     const latestBlockhash = await connection.getLatestBlockhash();
  //     let TX = new Transaction(latestBlockhash);
  //     TX.feePayer = OWNER.publicKey;
  //     //console.log(IXes);
    // for(const {instructions} of [...IXes]){
    //     TX.add(...instructions);
    //     console.log(...instructions);
    // };
  //     //console.log(TX);
  //     const txid = await connection.simulateTransaction(TX,[OWNER]);
  //     console.log(txid);
  // };
  
  
  