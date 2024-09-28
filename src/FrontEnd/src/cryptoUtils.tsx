import { Buffer } from "buffer";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

export const secretKey = Uint8Array.from(
  Buffer.from(localStorage.getItem("secretKey") || "", "base64"),
);
export const publicKey = Keypair.fromSecretKey(secretKey).publicKey;

export const getBalance = async () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const balance = (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL;
  console.log("Balance is: ", balance);
  return balance;
};

const requestAndConfirmAirdrop = async (
  connection: Connection,
  publicKey: PublicKey,
  amount: number,
) => {
  const airdropTransactionSignature = await connection.requestAirdrop(
    publicKey,
    amount,
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTransactionSignature,
    },

    "finalized",
  );
  return connection.getBalance(publicKey, "finalized");
};

const airdropIfRequired = async (
  connection: Connection,
  publicKey: PublicKey,
  airdropAmount: number,
) => {
  return requestAndConfirmAirdrop(connection, publicKey, airdropAmount);
};

export const EXCHANGE_RATE = 133.88;

export async function airdropSolana(amount: number) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const status = await airdropIfRequired(
    connection,
    publicKey,
    amount * LAMPORTS_PER_SOL,
  ).catch((error) => {
    console.error("Error: ", error);
  });
  console.log("Airdrop status is: ", status);
}

export const sendSol = async (amount: number, recipient: string) => {
  if (!recipient) {
    throw new Error("Recipient address is required");
  }

  const senderKeypair = Keypair.fromSecretKey(secretKey);

  const recieverPubkey = new PublicKey(recipient);
  console.log(`senderKeypair: ${publicKey.toBase58()}`);

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const transaction = new Transaction();

  const sendSolInstruction = SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: recieverPubkey,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  transaction.add(sendSolInstruction);

  const signature = sendAndConfirmTransaction(connection, transaction, [
    senderKeypair,
  ]);

  console.log(`💸 Finished! Sent ${amount} to the address ${recieverPubkey}. `);
  console.log(`Transaction signature is ${signature}!`);
};
