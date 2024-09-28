import { Buffer } from "buffer";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
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
  minimumBalance: number,
) => {
  const balance = await connection.getBalance(publicKey, "confirmed");
  if (balance < minimumBalance) {
    return requestAndConfirmAirdrop(connection, publicKey, airdropAmount);
  }
  console.log("Balance is sufficient. No airdrop required.");
  return balance;
};

export const EXCHANGE_RATE = 133.88;

export async function airdropSolana(amount: number) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const status = await airdropIfRequired(
    connection,
    publicKey,
    amount,
    0.0025 * LAMPORTS_PER_SOL,
  ).catch((error) => {
    console.error("Error: ", error);
  });
  console.log("Airdrop status is: ", status);
}
