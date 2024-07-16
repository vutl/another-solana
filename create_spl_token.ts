import {
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  Connection,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { AuthorityType } from '@solana/spl-token';
import {
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
} from '@solana/spl-token';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { MPL_TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey, toWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { createNoopSigner } from '@metaplex-foundation/umi';

import {
  RPC_ENDPOINT,
  FEE_WALLET,
  REVOKE_MINT_AUTHORITY_FEE,
  REVOKE_FREEZE_AUTHORITY_FEE,
  METADATA_IMMUTABLE_FEE,
  CREATE_TOKEN_FEE,
  CREATE_TOKEN_FEE_EXEMPT,
  BALANCE_THRESHOLD,
} from './constant';

const umi = createUmi(RPC_ENDPOINT);
umi.use(mplTokenMetadata());

export async function create_token(
  connection: Connection,
  owner_pubkey: PublicKey,
  mint: Keypair,
  _supply_amount: number,
  token_decimals: number,
  metadata_immutable_flag: boolean = true,
  revoke_mint_authority_flag: boolean = true,
  revoke_freeze_authority_flag: boolean = true,
  token_name: string,
  token_symbol: string,
  metadata_uri: string
): Promise<VersionedTransaction> {
  // get correct supply amount
  const supply_amount = _supply_amount * 10 ** token_decimals;
  // init transaction
  const ixes : TransactionInstruction[] =[];
  ixes.push(
    // create account
    SystemProgram.createAccount({
      fromPubkey: owner_pubkey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(connection),
      programId: TOKEN_PROGRAM_ID,
    })
  );
  // init mint
  if (revoke_freeze_authority_flag) {
    ixes.push(
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        token_decimals, // decimals
        owner_pubkey, // mint authority (an auth to mint token)
        null // freeze authority (we use null first, the auth can let you freeze user's token account)
      )
    );
  } else {
    ixes.push(
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        token_decimals, // decimals
        owner_pubkey, // mint authority (an auth to mint token)
        owner_pubkey // freeze authority (we use null first, the auth can let you freeze user's token account)
      )
    );
  };

  // create associated token account
  let ata = await getAssociatedTokenAddress(
    mint.publicKey, // mint
    owner_pubkey, // owner
    false // allow owner off curve
  );
  ixes.push(
    createAssociatedTokenAccountInstruction(
      owner_pubkey, // payer
      ata, // ata
      owner_pubkey, // owner
      mint.publicKey // mint
    )
  );

  // mint to ata
  ixes.push(
    createMintToInstruction(mint.publicKey, ata, owner_pubkey, supply_amount, [], TOKEN_PROGRAM_ID)
  );

  // Create metadata account
  // find metadata account PDA
  const [metadata_pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID).toBytes(),
      mint.publicKey.toBytes(),
    ],
    new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID)
  );

  //Metadata Account instruction Args (instruction data)
  const args: CreateMetadataAccountV3InstructionArgs = {
    data: {
      name: token_name,
      symbol: token_symbol,
      uri: metadata_uri,
      sellerFeeBasisPoints: 0,
      collection: null,
      creators: [{ address: fromWeb3JsPublicKey(owner_pubkey), verified: true, share: 100 }],
      uses: null,
    },
    isMutable: !metadata_immutable_flag,
    collectionDetails: null,
  };

  //The tx builder expects the type of mint authority and signer to be `Signer`, so built a dummy Signer instance
  // const signer = {
  //   publicKey: fromWeb3JsPublicKey(owner_pubkey),
  //   signTransaction: null,
  //   signMessage: null,
  //   signAllTransactions: null
  // };
  const signer = createNoopSigner(fromWeb3JsPublicKey(owner_pubkey));
  //Metadata account instruction Accounts
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    metadata: fromWeb3JsPublicKey(metadata_pda),
    mint: fromWeb3JsPublicKey(mint.publicKey),
    mintAuthority: signer,
    payer: signer,
    updateAuthority: fromWeb3JsPublicKey(owner_pubkey),
  };

  //Arguments merged to match the parameter required by the method
  const fullArgs = { ...accounts, ...args };
  const metadataBuilder = createMetadataAccountV3(umi, fullArgs);
  const _ix = metadataBuilder.getInstructions();
  //console.log(_ix)
  const ix: any = _ix[0];
  //console.log(ix)
  ix.keys = ix.keys.map((key: any) => {
    const newKey = { ...key };
    //console.log(newKey)
    newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
    //console.log(newKey)
    return newKey;
  });
  ix.programId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  ixes.push(ix);

  // revoke mint authority
  if (revoke_mint_authority_flag) {
    ixes.push(
      createSetAuthorityInstruction(
        mint.publicKey,
        owner_pubkey,
        AuthorityType.MintTokens,
        null,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  };

  let createTokenFee = CREATE_TOKEN_FEE;
  if(CREATE_TOKEN_FEE_EXEMPT.includes(owner_pubkey.toString())){
    createTokenFee = 0;
  };
  //console.log(CREATE_TOKEN_FEE_EXEMPT.includes(owner_pubkey.toString()),createTokenFee, owner_pubkey, CREATE_TOKEN_FEE_EXEMPT);
  ixes.push(
    SystemProgram.transfer({
      fromPubkey: owner_pubkey,
      toPubkey: FEE_WALLET,
      lamports: createTokenFee * LAMPORTS_PER_SOL,
    })
  );

  const txMessage = new TransactionMessage(
    {
      payerKey: owner_pubkey,
      recentBlockhash: '',
      instructions: ixes
    }
  ).compileToV0Message();
  const tx = new VersionedTransaction(txMessage);
  return tx;
}

export async function check_sol_balance(
  connection: Connection,
  payer_pubkey: PublicKey,
  metadata_immutable_flag: boolean,
  revoke_mint_authority_flag: boolean,
  revoke_freeze_authority_flag: boolean
): Promise<boolean> {
  const balance = await connection.getBalance(payer_pubkey);
  let balance_threshold = BALANCE_THRESHOLD;

  if (metadata_immutable_flag) {
    balance_threshold += METADATA_IMMUTABLE_FEE;
  }
  if (revoke_mint_authority_flag) {
    balance_threshold += REVOKE_MINT_AUTHORITY_FEE;
  }
  if (revoke_freeze_authority_flag) {
    balance_threshold += REVOKE_FREEZE_AUTHORITY_FEE;
  }

  if (balance > balance_threshold * LAMPORTS_PER_SOL) {
    return true;
  } else {
    return false;
  }
};

// export async function create_spl_token(
//   connection: Connection,
//   owner_pubkey: PublicKey,
//   mint: Keypair,
//   _supply_amount: number,
//   token_decimals: number,
//   metadata_immutable_flag: boolean = false,
//   revoke_mint_authority_flag: boolean = false,
//   revoke_freeze_authority_flag: boolean = false,
//   token_name: string,
//   token_symbol: string,
//   metadata_uri: string
// ): Promise<Transaction | null> {
//   if (
//     await check_sol_balance(
//       connection,
//       owner_pubkey,
//       metadata_immutable_flag,
//       revoke_mint_authority_flag,
//       revoke_freeze_authority_flag
//     )
//   ) {
//     const tx = await create_token(
//       connection,
//       owner_pubkey,
//       mint,
//       _supply_amount,
//       token_decimals,
//       metadata_immutable_flag,
//       revoke_mint_authority_flag,
//       revoke_freeze_authority_flag,
//       token_name,
//       token_symbol,
//       metadata_uri
//     );
//     return tx;
//   } else {
//     return null;
//   }
// }
