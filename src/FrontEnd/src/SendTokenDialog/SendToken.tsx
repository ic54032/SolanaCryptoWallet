import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { getBalance, sendToken } from "../cryptoUtils";
import { CheckCircleIcon } from "lucide-react";
import { Metadata } from "../Assets/AssetsDiv";
interface SendTokenDialogProps {
  open: boolean;
  handleClose: () => void;
  metadata: Metadata | null;
}

const SendTokenDialog: React.FC<SendTokenDialogProps> = ({
  open,
  handleClose,
  metadata,
}) => {
  const [amount, setAmount] = useState<string>("0");
  const [recipient, setRecipient] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  const [token, setToken] = useState<Metadata>(
    metadata ?? { name: "", symbol: "", amount: 0, mint: "" },
  );

  useEffect(() => {
    setToken(metadata ?? { name: "", symbol: "", amount: 0, mint: "" });
    const fetchBalance = async () => {
      const balance = await getBalance();
      setBalance(balance);
    };
    fetchBalance();
  }, [metadata]);

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

  function handleSend() {
    try {
      sendToken(parseFloat(amount), recipient, token).then(() => {
        setTransactionSuccess(true);
      });
    } catch (error) {
      console.error("Transaction failed: ", error);
      setTransactionSuccess(false);
    }
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth={true}
      sx={{
        "& .MuiDialog-paper": {
          width: "30%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent className="w-full bg-gray-900 text-white p-6">
        <DialogTitle className="text-xl font-semibold mb-6">
          Send {token.symbol}
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
                placeholder="Type or paste"
              />
            </div>
          </div>

          {token.amount < parseFloat(amount) && (
            <div className="text-sm text-red-500 bg-red-900 bg-opacity-50 p-2 rounded">
              Insufficient funds.
            </div>
          )}
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
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
            disabled={parseFloat(amount) < 0.01}
          >
            Send {token.symbol}
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

export default SendTokenDialog;
