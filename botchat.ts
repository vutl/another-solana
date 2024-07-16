import TelegramBot, { Message, CallbackQuery } from 'node-telegram-bot-api';
import { connectWallet, createKeypair } from './wallet';
import { create_token } from './create_spl_token';
import { CreateLPInstructions } from './create_raydium_lp';
import { PublicKey, Keypair, Connection, VersionedTransaction, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js'; // Import BN here
import {
  RPC_ENDPOINT,
} from './constant';

const api_id = '29398688';
const api_hash = '2eb07147c2fd51961182419fb7c19ead';
const bot_token = '7079490697:AAENOdhLs7PbvbugoLnANNvJthlzaw8beOc';

const bot = new TelegramBot(bot_token, { polling: true });

interface Wallet {
  address: string;
  balance: string;
}

let connectedWallet: Wallet | null = null;

const connection = new Connection(RPC_ENDPOINT, 'confirmed'); // Using devnet

const getStartMessage = (): string => `
The Fastest SPL Token Creator on Solana - SolMint Token Tools
Website | Telegram | Twitter
• Create SPL token: 0.1 SOL
• Openbook Market Id: 0.6 SOL
• Create LP on Raydium: 0.6 SOL
• Burn LP: 0.15 SOL
• Lock LP: 0.25 SOL
• Fast Remove LP: 0.5 SOL
Main Wallet
Address: ${connectedWallet ? connectedWallet.address : 'n/a'}
Balance: ${connectedWallet ? connectedWallet.balance + ' SOL' : 'n/a'}
www.solmint.dev
SOLMINT | Release your project in 30 seconds
We have every tool you need to build a successful solana project!
`;

const buttons = [
  [
    { text: "Connect Wallet", callback_data: 'connectwallet' },
    { text: "Generate New Wallet", callback_data: 'createkeypair' },
  ],
  [
    { text: "Create Token", callback_data: 'createtoken' },
    { text: "Create OpenBook", callback_data: 'createopenbook' },
    { text: "Create LP", callback_data: 'createlpr' },
  ],
  [
    { text: "Burn", callback_data: 'burn' },
    { text: "Remove LP", callback_data: 'fastremovelp' },
    { text: "Lock LP", callback_data: 'locklp' },
  ],
  [
    { text: "Close", callback_data: 'close' }
  ]
];

bot.onText(/\/start/, (msg: Message) => {
  bot.sendMessage(msg.chat.id, getStartMessage(), {
    reply_markup: {
      inline_keyboard: buttons
    }
  });
});

bot.on('callback_query', async (query: CallbackQuery) => {
  if (!query.message) return;
  const button = query.data;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  if (button === 'connectwallet') {
    bot.sendMessage(chatId, 'Please enter your wallet private key:').then(() => {
      bot.once('message', async (msg: Message) => {
        if (msg.text && !msg.text.startsWith('/')) {
          try {
            const walletInfo = await connectWallet(msg.text.trim());
            connectedWallet = walletInfo;
            bot.sendMessage(msg.chat.id, 'Wallet connected successfully.');
            bot.sendMessage(msg.chat.id, getStartMessage(), {
              reply_markup: {
                inline_keyboard: buttons
              }
            });
          } catch (error) {
            bot.sendMessage(msg.chat.id, 'Failed to connect wallet. Please check your private key and try again.');
          }
        }
      });
    });
  } else if (button === 'createkeypair') {
    const keypair = createKeypair();
    bot.sendMessage(chatId, `New Wallet Info:\nAddress: ${keypair.publicKey}\nPrivate Key: ${keypair.privateKey}\n\nPlease keep your private key safe and do not share it with anyone.`);
  } else if (button === 'close') {
    bot.deleteMessage(chatId, messageId);
  } else if (button === 'createtoken') {
    if (!connectedWallet) {
      bot.sendMessage(chatId, "Please connect or create a new wallet to use the features. Use the /wallet command to do it");
    } else {
      bot.sendMessage(chatId, 'Please enter the following details for creating the token in the format:\n\nName, Symbol, Supply Amount, Decimals, Metadata URI\n\nExample:\nMyToken, MTK, 1000000, 9, https://example.com/metadata.json').then(() => {
        bot.once('message', async (msg: Message) => {
          const details = msg.text?.split(',').map(item => item.trim());
          if (!details || details.length !== 5) {
            bot.sendMessage(msg.chat.id, 'Invalid input format. Please enter the details correctly.');
          } else {
            const [name, symbol, supply, decimals, uri] = details;
            try {
              const mint = Keypair.generate();
              const tx = await create_token(
                connection,
                new PublicKey(connectedWallet!.address),
                mint,
                parseInt(supply),
                parseInt(decimals),
                true,
                true,
                true,
                name,
                symbol,
                uri
              );

              // Sign the transaction with the mint keypair
              tx.sign([mint]);

              // Send the signed transaction
              const txid = await connection.sendTransaction(tx);

              bot.sendMessage(msg.chat.id, `Token created successfully.\nTransaction ID: ${txid}`);
            } catch (error) {
              console.error(error);
              bot.sendMessage(msg.chat.id, 'Failed to create token. Please check your inputs and try again.');
            }
          }
        });
      });
    }
  } else if (button === 'createlpr') {
    if (!connectedWallet) {
      bot.sendMessage(chatId, "Please connect or create a new wallet to use the features. Use the /wallet command to do it");
    } else {
      bot.sendMessage(chatId, 'Please enter the following details for creating the Raydium LP in the format:\n\nMarket ID, Base Amount, Quote Amount, Start Time\n\nExample:\nMarketID, 1000000, 1000000, 3000').then(() => {
        bot.once('message', async (msg: Message) => {
          const details = msg.text?.split(',').map(item => item.trim());
          if (!details || details.length !== 4) {
            bot.sendMessage(msg.chat.id, 'Invalid input format. Please enter the details correctly.');
          } else {
            const [marketId, baseAmount, quoteAmount, startTime] = details;
            try {
              const txInstructions = await CreateLPInstructions(
                connection,
                new PublicKey(connectedWallet!.address),
                new PublicKey(marketId),
                new BN(baseAmount),
                new BN(quoteAmount),
                new BN(startTime)
              );

              const latestBlockhash = await connection.getLatestBlockhash();
              const tx = new VersionedTransaction({
                feePayer: new PublicKey(connectedWallet!.address),
                recentBlockhash: latestBlockhash.blockhash,
                instructions: txInstructions,
              });

              // Sign the transaction
              tx.sign([Keypair.fromSecretKey(Buffer.from(connectedWallet!.address, 'base64'))]);

              // Send the signed transaction
              const txid = await connection.sendTransaction(tx);

              bot.sendMessage(msg.chat.id, `Raydium LP created successfully.\nTransaction ID: ${txid}`);
            } catch (error) {
              console.error(error);
              bot.sendMessage(msg.chat.id, 'Failed to create Raydium LP. Please check your inputs and try again.');
            }
          }
        });
      });
    }
  } else {
    bot.editMessageText('Invalid selection', {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  }
});

bot.onText(/\/wallet/, (msg: Message) => {
  const chatId = msg.chat.id;
  if (!connectedWallet) {
    bot.sendMessage(chatId, "⚡ SOL\nNo wallet found", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Connect Wallet", callback_data: 'connectwallet' }],
          [{ text: "Generate New Wallet", callback_data: 'createkeypair' }],
          [{ text: "CLOSE", callback_data: 'close' }]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, `⚡ SOL\nAddress: ${connectedWallet.address}\nBalance: ${connectedWallet.balance} SOL`);
  }
});
