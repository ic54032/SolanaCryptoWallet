import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { airdropSolana, EXCHANGE_RATE } from "../cryptoUtils";
import { CheckCircleIcon } from "lucide-react";
interface BuyDialogProps {
  open: boolean;
  handleClose: () => void;
}

const BuyDialog: React.FC<BuyDialogProps> = ({ open, handleClose }) => {
  const [spendAmount, setSpendAmount] = useState(EXCHANGE_RATE.toString());
  const [receiveAmount, setReceiveAmount] = useState("1");
  const [buySuccess, setBuySuccess] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) {
      return; // Exit if the value is not a whole number
    }
    setReceiveAmount(value);
    setSpendAmount(((parseFloat(value) | 0) * EXCHANGE_RATE).toFixed(2));
  };

  const handleBuy = async () => {
    try {
      await airdropSolana(parseFloat(receiveAmount));
      setBuySuccess(true);
    } catch (error) {
      console.error("Transaction failed: ", error);
      setBuySuccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white p-6">
        <DialogTitle className="text-xl font-semibold mb-6">
          Buy Solana
        </DialogTitle>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <label className="text-sm text-gray-400">You get</label>
            <div className="flex justify-between items-center mt-1">
              <input
                type="text"
                value={receiveAmount}
                onChange={(e) => handleInputChange(e)}
                className="bg-transparent text-xl font-semibold focus:outline-none"
              />
              <button className="bg-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                <span className="mr-1">≋</span> SOL
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">Solana</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <label className="text-sm text-gray-400">For price</label>
            <div className="flex justify-between items-center mt-1">
              <input
                type="text"
                value={spendAmount}
                readOnly
                className="bg-transparent text-xl font-semibold focus:outline-none"
              />
              <button className="bg-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                <span className="mr-1">🇪🇺</span> EUR
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400 flex justify-center items-center">
            <span>1 SOL = 133.88 EUR</span>
          </div>
        </div>
        <DialogActions className="mt-6 justify-center">
          <button
            onClick={handleBuy}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded"
          >
            Buy SOL
          </button>
        </DialogActions>
        {buySuccess && (
          <div className="flex justify-center mt-4">
            <CheckCircleIcon style={{ color: "green" }} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyDialog;
