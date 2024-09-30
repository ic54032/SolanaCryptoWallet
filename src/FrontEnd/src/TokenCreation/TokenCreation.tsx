import React, { useRef, useState } from "react";
import { Input } from "@mui/material";
import { createAndMintToken } from "./create-and-mint-token";
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
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  getMint,
  getMetadataPointerState,
  getTokenMetadata,
  TYPE_SIZE,
  LENGTH_SIZE,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  createRemoveKeyInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

export interface TokenFormData {
  name: string;
  symbol: string;
  initialSupply: string;
}

const SolanaTokenCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    initialSupply: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    handleCreateToken();
    e.preventDefault();
    // Here you would typically call a function to interact with Solana
    console.log("Token Creation Data:", formData);
    // Reset form after submission
    setFormData({ name: "", symbol: "", initialSupply: "" });
  };

  const handleCreateToken = async () => {
    try {
      const mint = await createAndMintToken(formData);
      console.log("Mint created: ", mint.toBase58());
    } catch (error) {
      console.error("Minting failed: ", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-800 p-6 rounded-lg max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-yellow-500 mb-6">
        Create Solana Token
      </h2>

      <div className="space-y-2">
        <label htmlFor="name" className="text-yellow-500">
          Token Name
        </label>
        <div className="flex items-center space-x-4">
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., My Awesome Token"
            required
            className="w-2/3 bg-gray-300 text-white border-gray-600 focus:border-blue-500 rounded-md pl-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="symbol" className="text-yellow-500">
          Token Symbol
        </label>
        <div className="flex items-center space-x-4">
          <Input
            id="symbol"
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
            placeholder="e.g., MAT"
            required
            className="w-2/3 bg-gray-200 text-white border-gray-600 focus:border-blue-500 rounded-md pl-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="initialSupply" className="text-yellow-500">
          Initial Supply
        </label>
        <div className="flex items-center space-x-4">
          <Input
            id="initialSupply"
            name="initialSupply"
            type="number"
            value={formData.initialSupply}
            onChange={handleInputChange}
            placeholder="e.g., 1000000"
            required
            className="w-2/3 bg-gray-200 text-white border-gray-600 focus:border-blue-500 rounded-md pl-2"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
      >
        Create Token
      </button>
    </form>
  );
};

export default SolanaTokenCreationForm;
