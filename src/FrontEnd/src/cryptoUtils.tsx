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
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Metadata } from "./Assets/AssetsDiv";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
  getTokenMetadata,
} from "@solana/spl-token";

export const getSecretKey = () => {
  const secretKey = Uint8Array.from(
    Buffer.from(localStorage.getItem("secretKey") || "", "base64"),
  );
  return secretKey;
};

export const getBalance = async () => {
  const secretKey = getSecretKey();
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey;
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
  const secretKey = getSecretKey();
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey;
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
  const secretKey = getSecretKey();
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey;
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

export interface TransactionDetails {
  sender: string;
  recipient: string;
  time: string;
  value: number;
  token: string;
}

export async function askGemini(
  transactions: TransactionDetails[],
  searchTerm: string,
) {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is required");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "You are a smart search tool for solana transactions." +
    " Your response must be numbers that represent transaction IDs," +
    " for example if IDs that match the search are 1,3 and 4, your response should be '1,3,4'." +
    " These are the transactions of current user: \n" +
    transactions
      .map(
        (transaction, index) =>
          "transaction ID: " +
          index +
          " " +
          transaction.sender +
          " sent " +
          transaction.value +
          " " +
          transaction.token +
          " to " +
          transaction.recipient +
          ". Date and time of transaction: " +
          transaction.time,
      )
      .join("\n") +
    ".\n\n" +
    "This is the search term: " +
    searchTerm;

  const result = await model.generateContent(prompt);
  console.log(result.response.text());

  const response = result.response.text().trim().split(",");

  return transactions.filter((_, index) => response.includes(index.toString()));
}

export async function mapTransaction(
  transaction: VersionedTransactionResponse | null,
  connection: Connection,
) {
  if (
    !transaction ||
    !transaction.transaction ||
    !transaction.transaction.message ||
    !transaction.meta ||
    !transaction.meta.preBalances ||
    !transaction.meta.postBalances ||
    !transaction.transaction.message.getAccountKeys() ||
    !transaction.transaction.message.getAccountKeys().get(0) ||
    !transaction.transaction.message.getAccountKeys().get(1) ||
    !transaction.slot
  ) {
    return null;
  }
  const accountKeys = transaction.transaction.message.getAccountKeys();
  if (!accountKeys) {
    return null;
  }

  const senderKey = accountKeys.get(0);
  const recipientKey = accountKeys.get(1);
  if (!senderKey || !recipientKey) {
    return null;
  }

  let senderKeyString = senderKey.toBase58();
  let recipientKeyString = recipientKey.toBase58();

  let value =
    (transaction.meta.preBalances[0] - transaction.meta.postBalances[0]) / 1e9;
  let token = "SOL";

  if (
    transaction.meta.postTokenBalances &&
    transaction.meta.preTokenBalances &&
    transaction.meta.postTokenBalances[0] &&
    transaction.meta.preTokenBalances[0] &&
    transaction.meta.postTokenBalances[0].uiTokenAmount.uiAmount &&
    transaction.meta.preTokenBalances[0].uiTokenAmount.uiAmount &&
    transaction.meta.postTokenBalances[1] &&
    transaction.meta.postTokenBalances[1].owner
  ) {
    value =
      transaction.meta.postTokenBalances[0].uiTokenAmount.uiAmount -
      transaction.meta.preTokenBalances[0].uiTokenAmount.uiAmount;

    const mint = new PublicKey(
      transaction.meta.postTokenBalances[0].mint.toString(),
    );
    recipientKeyString = transaction.meta.postTokenBalances[1].owner.toString();
    const metadata = await getTokenMetadata(connection, mint);
    token = metadata!.symbol;
  }

  const secretKeyString = localStorage.getItem("secretKey");
  if (!secretKeyString) {
    throw new Error("SECRET_KEY is not defined");
  }
  const secretKey = Uint8Array.from(Buffer.from(secretKeyString, "base64"));
  const keypair = Keypair.fromSecretKey(secretKey);
  const publicKey = keypair.publicKey.toString();

  if (senderKey.toBase58() === publicKey) {
    senderKeyString = senderKeyString + " (You)";
  } else if (recipientKey.toBase58() === publicKey) {
    recipientKeyString = recipientKeyString + " (You)";
  }

  const time = await connection.getBlockTime(transaction.slot);

  return {
    sender: senderKeyString,
    recipient: recipientKeyString,
    time: time ? new Date(time * 1000).toLocaleString() : "Unknown",
    value: Math.abs(value),
    token: token,
  };
}

export const sendToken = async (
  amount: number,
  recipient: string,
  token: Metadata,
) => {
  const secretKey = getSecretKey();
  const ownerKeypair = Keypair.fromSecretKey(secretKey);
  const mint = new PublicKey(token.mint);

  if (!recipient) {
    throw new Error("Recipient address is required");
  }

  const recieverPubkey = new PublicKey(recipient);

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    ownerKeypair,
    mint,
    ownerKeypair.publicKey,
    undefined,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    ownerKeypair,
    mint,
    recieverPubkey,
    undefined,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID,
  );

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      ownerKeypair.publicKey,
      amount * LAMPORTS_PER_SOL,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  await sendAndConfirmTransaction(connection, transaction, [ownerKeypair]);
};
