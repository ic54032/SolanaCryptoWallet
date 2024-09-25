import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BuyDialog from "../BuyDialog/Buy";
import SendDialog from "../SendDialog/Send";
import { Keypair } from "@solana/web3.js";

const HomePage = () => {
  const [openBuy, setOpenBuy] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const username = useLocation().state.username;

  const getPublicKey = () => {
    const secretKeyStr = localStorage.getItem("secretKey");
    if (!secretKeyStr) {
      return "No secret key found in localStorage";
    }
    // Convert the base64-encoded string to Uint8Array
    try {
      const secretKey = Uint8Array.from(Buffer.from(secretKeyStr, "base64"));
      const keypair = Keypair.fromSecretKey(secretKey);
      return `${keypair.publicKey.toString().slice(0, 4)}...${keypair.publicKey.toString().slice(-4)}`;
    } catch (error) {
      return "Failed to decode the secret key";
    }
  };

  const shortenPublicKey = () => {
    //const publicKey =
  };

  const handleClickOpenBuy = () => {
    setOpenBuy(true);
  };

  const handleCloseBuy = () => {
    setOpenBuy(false);
  };

  const handleClickOpenSend = () => {
    setOpenSend(true);
  };

  const handleCloseSend = () => {
    setOpenSend(false);
  };

  return (
    <div className="text-white">
      <div className="nav-bar flex justify-between items-center p-4 px-20 bg-gray-800 w-full">
        <Link to="/" className="logo text-2xl font-bold">
          🧂PAG
        </Link>
        <div className="nav-links space-x-6">
          <Link to="/" className="hover:text-gray-300">
            Transactions
          </Link>
          <Link
            to="#"
            onClick={handleClickOpenBuy}
            className="hover:text-gray-300"
          >
            Buy
          </Link>
          <Link
            to="#"
            onClick={handleClickOpenSend}
            className="hover:text-gray-300"
          >
            Send
          </Link>
        </div>
        <div className="max-w-l px-4">{username}</div>
      </div>
      <div className="home-page bg-gray-900 text-white min-h-screen px-20">
        <div className="main-content p-6">
          <h3 className="text-xl mb-2">Balance</h3>
          <div className="balance-holder flex items-baseline">
            <h1 className="text-4xl font-bold">$</h1>
            <h1 className="text-4xl font-bold">0.00</h1>
          </div>
          <div>
            <div className="text-right">
              <div className="text-white">Main Wallet</div>
              <div className="text-gray-400 flex items-center">
                {getPublicKey()}
              </div>
            </div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="p-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Assets</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Price/24h change</th>
                  <th className="pb-2">Value</th>
                  <th className="pb-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/api/placeholder/24/24"
                        alt="Solana logo"
                        className="w-6 h-6"
                      />
                      <div>
                        <p>Solana</p>
                        <p className="text-sm text-gray-400">SOL</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p>$148.01</p>
                    <p className="text-sm text-green-500">+1.48%</p>
                  </td>
                  <td>$0.00</td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <BuyDialog open={openBuy} handleClose={handleCloseBuy} />
        <SendDialog open={openSend} handleClose={handleCloseSend} />
      </div>
    </div>
  );
};

export default HomePage;
