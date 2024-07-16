//import { getAccount, getMint } from "@solana/spl-token";
import { getMint } from '@solana/spl-token';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import BN from 'bn.js';

export const OPENBOOK_DEX = new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX');
export const EVENT_QUEUE_LENGTH = 2978;
export const EVENT_SIZE = 88;
export const EVENT_QUEUE_HEADER_SIZE = 32;

export const REQUEST_QUEUE_LENGTH = 63;
export const REQUEST_SIZE = 80;
export const REQUEST_QUEUE_HEADER_SIZE = 32;

export const ORDERBOOK_LENGTH = 909;
export const ORDERBOOK_NODE_SIZE = 72;
export const ORDERBOOK_HEADER_SIZE = 40;

export const validateMint = async (connection: Connection, mintAddress: string) => {
  const mint = await getMint(connection, new PublicKey(mintAddress));
  return mint;
};

// export const validateTokenAccount = async (
//   connection: Connection,
//   tokenAccountAddress: string,
//   mintAddress: string,
//   ownerAddress: string
// ) => {
//   const account = await getAccount(
//     connection,
//     new PublicKey(tokenAccountAddress)
//   );
//   if (
//     account.mint.toBase58() === mintAddress &&
//     account.owner.toBase58() === ownerAddress
//   ) {
//     return account;
//   } else throw new Error("Invalid mint/owner for token account");
// };

export async function getDecimals(connection: Connection, mint: PublicKey) {
  let res = await connection.getParsedAccountInfo(mint);
  let info = (res.value?.data as ParsedAccountData).parsed;
  return info.info.decimals;
}

export async function getVaultOwnerAndNonce(
  marketAddress: PublicKey,
  dexAddress: PublicKey
): Promise<[vaultOwner: PublicKey, nonce: BN]> {
  const nonce = new BN(0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const vaultOwner = await PublicKey.createProgramAddressSync(
        [marketAddress.toBuffer(), nonce.toArrayLike(Buffer, 'le', 8)],
        dexAddress
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
}

export type SerumMarketAccountSizes = {
  eventQueueLength: number;
  requestQueueLength: number;
  orderbookLength: number;
};

export function calculateTotalAccountSize(
  individualAccountSize: number,
  accountHeaderSize: number,
  length: number
) {
  const accountPadding = 12;
  const minRequiredSize = accountPadding + accountHeaderSize + length * individualAccountSize;

  const modulo = minRequiredSize % 8;

  return modulo <= 4 ? minRequiredSize + (4 - modulo) : minRequiredSize + (8 - modulo + 4);
}

export function calculateAccountLength(
  totalAccountSize: number,
  accountHeaderSize: number,
  individualAccountSize: number
) {
  const accountPadding = 12;
  return Math.floor(
    (totalAccountSize - accountPadding - accountHeaderSize) / individualAccountSize
  );
}

export async function ComputeSerumMarketAccountSizes(
  connection: Connection,
  { eventQueueLength, requestQueueLength, orderbookLength }: SerumMarketAccountSizes
) {
  const programID = OPENBOOK_DEX;

  const totalEventQueueSize = calculateTotalAccountSize(
    eventQueueLength,
    EVENT_QUEUE_HEADER_SIZE,
    EVENT_SIZE
  );

  const totalRequestQueueSize = calculateTotalAccountSize(
    requestQueueLength,
    REQUEST_QUEUE_HEADER_SIZE,
    REQUEST_SIZE
  );

  const totalOrderbookSize = calculateTotalAccountSize(
    orderbookLength,
    ORDERBOOK_HEADER_SIZE,
    ORDERBOOK_NODE_SIZE
  );

  const [marketAccountRent, eventQueueRent, requestQueueRent, orderbookRent] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(Market.getLayout(programID).span),
    connection.getMinimumBalanceForRentExemption(totalEventQueueSize),
    connection.getMinimumBalanceForRentExemption(totalRequestQueueSize),
    connection.getMinimumBalanceForRentExemption(totalOrderbookSize),
  ]);
  return {
    marketRent: marketAccountRent + eventQueueRent + requestQueueRent + 2 * orderbookRent,
    totalEventQueueSize,
    totalRequestQueueSize,
    totalOrderbookSize,
  };
}

export async function solBalanceCheck(connection: Connection, payer_pubkey: PublicKey) {
  const balance = await connection.getBalance(payer_pubkey);
  return balance;
}
