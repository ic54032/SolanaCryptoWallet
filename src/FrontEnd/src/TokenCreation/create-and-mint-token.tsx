import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMint,
  ExtensionType,
  getMint,
  getMintLen,
  getOrCreateAssociatedTokenAccount,
  LENGTH_SIZE,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import {
  Cluster,
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getSecretKey } from "../cryptoUtils";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

import { TokenFormData } from "./TokenCreation";

/**
 * Create a new mint and mint some tokens to the associated token account
 * THE ONLY CHANGE IS THE PROGRAM ID
 * @param cluster The cluster to connect to
 * @param connection The connection to use
 * @param tokenProgramId The program id to use for the token
 * @param payer The keypair to use for paying for the transactions
 * @param decimals The number of decimals to use for the mint
 * @param mintAmount The amount of tokens to mint
 * @returns The mint public key
 */
export async function createAndMintToken(
  formData: TokenFormData,
): Promise<PublicKey> {
  console.log("\nCreating a new mint...");
  const secretKey = getSecretKey();
  const keypair = Keypair.fromSecretKey(secretKey);
  const CLUSTER: Cluster = "devnet";
  const decimals = 9;
  const mintAmount = parseFloat(formData.initialSupply) * 10 ** decimals;
  const connection = new Connection(clusterApiUrl(CLUSTER));

  // Generate new keypair for Mint Account
  const mintKeypair = Keypair.generate();
  // Address for Mint Account
  const mint = mintKeypair.publicKey;

  const metaData: TokenMetadata = {
    updateAuthority: keypair.publicKey,
    mint: mint,
    name: formData.name,
    symbol: formData.symbol,
    uri: "",
    additionalMetadata: [["description", ""]],
  };

  // Size of MetadataExtension 2 bytes for type, 2 bytes for length
  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
  // Size of metadata
  const metadataLen = pack(metaData).length;

  // Size of Mint Account with extension
  const mintLen = getMintLen([ExtensionType.MetadataPointer]);

  // Minimum lamports required for Mint Account
  const lamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataExtension + metadataLen,
  );

  // Instruction to invoke System Program to create new account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: keypair.publicKey, // Account that will transfer lamports to created account
    newAccountPubkey: mint, // Address of the account to create
    space: mintLen, // Amount of bytes to allocate to the created account
    lamports, // Amount of lamports transferred to created account
    programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
  });

  const initializeMetadataPointerInstruction =
    createInitializeMetadataPointerInstruction(
      mint, // Mint Account address
      keypair.publicKey, // Authority that can set the metadata address
      mint, // Account address that holds the metadata
      TOKEN_2022_PROGRAM_ID,
    );

  const initializeMintInstruction = createInitializeMintInstruction(
    mint, // Mint Account Address
    decimals, // Decimals of Mint
    keypair.publicKey, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );

  const initializeMetadataInstruction = createInitializeInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: keypair.publicKey, // Authority that can update the metadata
    mint: mint, // Mint Account address
    mintAuthority: keypair.publicKey, // Designated Mint Authority
    name: metaData.name,
    symbol: metaData.symbol,
    uri: metaData.uri,
  });

  // Instruction to update metadata, adding custom field
  const updateFieldInstruction = createUpdateFieldInstruction({
    programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
    metadata: mint, // Account address that holds the metadata
    updateAuthority: keypair.publicKey, // Authority that can update the metadata
    field: metaData.additionalMetadata[0][0], // key
    value: metaData.additionalMetadata[0][1], // value
  });

  // Add instructions to new transaction
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMetadataPointerInstruction,
    // note: the above instructions are required before initializing the mint
    initializeMintInstruction,
    initializeMetadataInstruction,
    updateFieldInstruction,
  );

  // Send transaction
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [keypair, mintKeypair], // Signers
  );

  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );

  console.log("\nCreating associated token account...");
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    mint,
    keypair.publicKey,
    true,
    "finalized",
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID,
  );

  console.log(`Associated token account: ${tokenAccount.address.toBase58()}`);

  console.log("\nMinting to associated token account...");
  await mintTo(
    connection,
    keypair,
    mint,
    tokenAccount.address,
    keypair,
    mintAmount,
    [keypair],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID,
  );

  return mint;
}

export default createAndMintToken;
