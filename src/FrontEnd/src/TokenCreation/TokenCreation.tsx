import React, { useState } from "react";
import { Input } from "@mui/material";
import { createAndMintToken } from "./create-and-mint-token";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { CheckCircleIcon, Loader } from "lucide-react";

export interface TokenFormData {
  name: string;
  symbol: string;
  initialSupply: string;
}

interface TokenDialogProps {
  open: boolean;
  handleClose: () => void;
}

const SolanaTokenCreationForm: React.FC<TokenDialogProps> = ({
  open,
  handleClose,
}) => {
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    symbol: "",
    initialSupply: "",
  });
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  const [transactionLoading, setTransactionLoading] = useState<boolean>(false);

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
      setTransactionLoading(true);
      const mint = await createAndMintToken(formData);
      console.log("Mint created: ", mint.toBase58());
      setTransactionLoading(false);
      setTransactionSuccess(true);
    } catch (error) {
      console.error("Minting failed: ", error);
      setTransactionSuccess(false);
      setTransactionLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent className="w-full bg-gray-800 text-white">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-gray-800 rounded-lg"
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
        {transactionSuccess && (
          <div className="flex justify-center mt-4">
            <CheckCircleIcon style={{ color: "green" }} />
          </div>
        )}
        {transactionLoading && (
          <div className="flex justify-center mt-4">
            <Loader className="animate-spin text-gray-400" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SolanaTokenCreationForm;
