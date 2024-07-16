import { Keypair, Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

interface WalletInfo {
    address: string;
    balance: string;
}

export async function connectWallet(privateKey: string): Promise<WalletInfo> {
    try {
        const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'base64'));
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const balance = await connection.getBalance(keypair.publicKey);
        return {
            address: keypair.publicKey.toBase58(),
            balance: (balance / LAMPORTS_PER_SOL).toFixed(2)
        };
    } catch (error) {
        console.error('Error connecting wallet:', error);
        throw new Error('Invalid private key');
    }
}

export function createKeypair() {
    const keypair = Keypair.generate();
    return {
        publicKey: keypair.publicKey.toBase58(),
        privateKey: Buffer.from(keypair.secretKey).toString('base64')
    };
}
