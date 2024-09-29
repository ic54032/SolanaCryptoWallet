import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { sendSol, getBalance } from "../cryptoUtils";
import { CheckCircleIcon } from "lucide-react";
interface SendDialogProps {
  open: boolean;
  handleClose: () => void;
}

const SendDialog: React.FC<SendDialogProps> = ({ open, handleClose }) => {
  const [amount, setAmount] = useState<string>("0");
  const [recipient, setRecipient] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance();
      setBalance(balance);
    };
    fetchBalance();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "amount" | "recipient",
  ) => {
    const value = e.target.value;
    if (field === "amount") {
      setAmount(value);
    } else {
      setRecipient(value);
    }
  };

  const handleSend = async () => {
    try {
      await sendSol(parseFloat(amount), recipient);
      setTransactionSuccess(true);
    } catch (error) {
      console.error("Transaction failed: ", error);
      setTransactionSuccess(false);
    }
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white p-6">
        <DialogTitle className="text-xl font-semibold mb-6">
          Send Token
        </DialogTitle>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <label className="text-sm text-gray-400">Amount</label>
            <div className="flex justify-between items-center mt-1">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleInputChange(e, "amount")}
                className="bg-transparent text-xl font-semibold focus:outline-none"
                placeholder="0"
              />
              <button className="bg-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                <span className="mr-1">≋</span> SOL
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <label className="text-sm text-gray-400">Recipient</label>
            <div className="flex justify-between items-center mt-1">
              <input
                type="text"
                value={recipient}
                onChange={(e) => handleInputChange(e, "recipient")}
                className="bg-transparent text-xl font-semibold focus:outline-none w-full"
                placeholder="Search or paste"
              />
            </div>
          </div>

          {(balance ?? 0) < 0.01 && (
            <div className="text-sm text-red-500 bg-red-900 bg-opacity-50 p-2 rounded">
              Insufficient SOL. Please ensure you have at least 0.01 SOL in your
              wallet to cover network fees.
            </div>
          )}
        </div>

        <DialogActions className="mt-6 justify-center">
          <button
            onClick={handleSend}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            disabled={parseFloat(amount) < 0.01}
          >
            Send SOL
          </button>
        </DialogActions>
        {transactionSuccess && (
          <div className="flex justify-center mt-4">
            <CheckCircleIcon style={{ color: "green" }} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendDialog;
