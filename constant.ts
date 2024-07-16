import { PublicKey } from '@solana/web3.js';

//-------------------------------------------------------------------------------------
export const FEE_WALLET = new PublicKey("smt88azH6JA3fweTi2kX7NgH3QXhEMoFq4Mu2dYDuYv");
export const UNITPRICE = 10_000_000;
export const JITO_TIP = 1_000_000;
export const TIP_ACCOUNTS = [
    "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
    "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
    "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
    "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
    "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
    "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
    "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
    "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT"
];

// constant for create new token
export const UNITLIMIT_for_createtoken = 100000;
export const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU5NUU3NzVmQjcwZGIyRTA2Nzg3ODNBQjk0MWIwNjhjMkNCM0E4ODQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwOTc1MzQ3MDcwNywibmFtZSI6IkRyS2ltIn0.m59MAFsMYdM06w5u-IxbIuic95UEvvjBBbABjTe4VOM';
export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=ac64b741-8899-413d-84e7-4d05dee75e9b';
export const REVOKE_MINT_AUTHORITY_FEE = 0;//0.05;
export const REVOKE_FREEZE_AUTHORITY_FEE = 0;//0.05;
export const METADATA_IMMUTABLE_FEE = 0;//0.05;
export const CREATE_TOKEN_FEE = 0.2;
export const BALANCE_THRESHOLD = 0.02;//0.1257;
export const CREATE_TOKEN_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
    'HfGGPvhzbHQFUStpUsQDqhiebdd2aVHfGd8fimXALm3R',
];

// constant for create openbook-dex market ID
export const OPENBOOK_FEE = 0.477;
export const UNITLIMIT_for_createVaults = 10000;
export const UNITLIMIT_for_createMarket = 15000;
export const UNITPRICE_FOR_OPENBOOK = 1_000;
export const OPENBOOK_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];

// const for RAYDIUM REMOVE LP
export const RAYDIUM_REMOVE_LP_FEE = 0.5;
export const RAYDIUM_CREATE_LP_FEE = 0.2;
export const UNITPRICE_FOR_REVOME_RAYDIUM_LP = 1_000_000;
export const RAYDIUM_CREATE_LP_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];
export const RAYDIUM_REMOVE_LP_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];
export const RAYDIUM_SWAP_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];
export const RAYDIUM_SWAP_LP_FEE = 0.000;
export const RAYDIUM_CREATE_AND_SNIPE_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];
export const SNIPE_FEE = 0.5;
export const RAYDIUM_CREATE_AND_SNIPE_FEE = 4;
// const for burn token
export const TOKEN_BURN_FEE = 0.1;
export const TOKEN_BURN_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];

// const for Lock
export const UNIT_PRICE_FOR_LOCK = 1_000_000;
export const UNIT_LIMIT_FOR_LOCK = 60_000;
export const LOCK_FEE = 1;
export const LOCK_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];

//const for token multisender
export const UNIT_PRICE_AIRDROP = 1_000_000;
export const UNIT_LIMIT_AIRDROP = 300_000;
export const AIRDROP_FEE_EXEMPT = [
    'KaWLuZAXkP8HbAAobVxhXmpFbvZX1sGtZF3eA3xYW3Z',
    '5y4U5XjFA4HUihkvRyKcdVA5mXxSafafniww5P3e1HcN',
    'CsXY1pAubahFn9PEcxL75kTuaHxuryoG5HuuxbjAYKQw',
    '9edrasQG3q2MtsKSUTiS5jpPAnMH9bRBzWLSWnTVY3aq',
    'ChTuHvnbHq8vC9skb8VUDkrg4REdiSd8DDLhcbUjc4FU',
];

export const AIRDROP_FEE = 0.001;
export const DEFAULT_BATCH_SIZE = 9;

export const RPC_CONNECTION_LIST = [
    'https://mainnet.helius-rpc.com/?api-key=db51953c-f35e-4c89-9b08-7eedaef30cf8',
    'https://mainnet.helius-rpc.com/?api-key=1733c9c9-3af5-4f28-ac2b-23aa7ff9523e',
    'https://mainnet.helius-rpc.com/?api-key=b5e94c52-93b2-41ad-ae2b-8ba13d74ed31',
    'https://mainnet.helius-rpc.com/?api-key=1e5e4de0-fd8c-4439-a0b3-6bff94c2dc88',
    'https://mainnet.helius-rpc.com/?api-key=43847675-fd07-42b9-82cc-0b6ae55387db',
    'https://mainnet.helius-rpc.com/?api-key=be0d33c2-dd18-45ba-86da-cdd9fa594b25',
    'https://mainnet.helius-rpc.com/?api-key=4cad7f2d-31ac-47f3-866e-6800bef8dc3a',
    'https://mainnet.helius-rpc.com/?api-key=0f12ce60-9970-409c-a552-6fe07e81b294',
    'https://mainnet.helius-rpc.com/?api-key=d1274eda-11d7-4988-81b2-66f6e0437adb',
    'https://mainnet.helius-rpc.com/?api-key=ce001b4a-59e3-457f-ba87-52e1b70c390d',
    'https://mainnet.helius-rpc.com/?api-key=b954817f-cc78-4cc8-af9c-8a20196e930e',
    'https://mainnet.helius-rpc.com/?api-key=350ec4fb-6462-4a8c-8b3e-7e51304157ce',
    'https://mainnet.helius-rpc.com/?api-key=94438ae8-5e47-44ba-9ce5-3de9c157cfb2',
    'https://mainnet.helius-rpc.com/?api-key=fd044e3f-8493-423c-99bc-66981a01ee22',
    'https://mainnet.helius-rpc.com/?api-key=94bd5d82-f52a-4bec-8242-e9ccc962227c',
    'https://mainnet.helius-rpc.com/?api-key=967ef728-8c92-48eb-89fe-75782bfa569d',
    'https://mainnet.helius-rpc.com/?api-key=09e81522-26ea-4057-941f-ad32eb7d4858',
    'https://mainnet.helius-rpc.com/?api-key=e5280f50-da04-483f-a56b-d177d2936603',
    'https://mainnet.helius-rpc.com/?api-key=568386a0-d178-425f-b4ca-82df65a9c63f',
    'https://mainnet.helius-rpc.com/?api-key=62f38390-fdc3-4a5a-9de5-d36889b596b1',
    'https://mainnet.helius-rpc.com/?api-key=2e152a4d-ef02-4652-b922-517def1daf0c',
    'https://mainnet.helius-rpc.com/?api-key=ac64b741-8899-413d-84e7-4d05dee75e9b',
    'https://mainnet.helius-rpc.com/?api-key=5d380861-1af2-4888-801c-2b1117602534',
    'https://mainnet.helius-rpc.com/?api-key=d96ee238-1b39-43b7-9285-1d0d3830d16f',
    'https://mainnet.helius-rpc.com/?api-key=aa89f5e1-bf91-44f8-bb46-24f53ccc6e5f',
    'https://mainnet.helius-rpc.com/?api-key=98fc9bc9-a7f7-498a-88f4-7419701043a1',
    'https://mainnet.helius-rpc.com/?api-key=1112a9cf-5011-49a0-99ed-e85acdea8557',
    'https://mainnet.helius-rpc.com/?api-key=c3ff5eca-4754-4894-9301-a664c1092cc7',
    'https://mainnet.helius-rpc.com/?api-key=8b28172b-58e6-4fdd-a590-5057f84af3ae',
    'https://mainnet.helius-rpc.com/?api-key=56a3c774-04cd-4874-b998-ff628f977140',
    'https://mainnet.helius-rpc.com/?api-key=a6f934a9-5cf6-40e3-be93-4f7020f5d1be',
    'https://mainnet.helius-rpc.com/?api-key=a829e686-d912-4009-b5ce-d3270c24e58a',
    'https://mainnet.helius-rpc.com/?api-key=e0608721-a141-4d42-8770-8ceb445e42ef',
    'https://mainnet.helius-rpc.com/?api-key=09345c2b-0fcb-47cd-82f2-a6482a9bf0aa',
];
export const SEND_TX_DELAY = 1000;
export const SPAM_COEFF = 15;