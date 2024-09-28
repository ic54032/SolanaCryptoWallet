import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BuyDialog from "../BuyDialog/Buy";
import SendDialog from "../SendDialog/Send";
import TransactionsDialog from "../TransactionsDialog/Transactions";
import { Keypair } from "@solana/web3.js";
import axios from "axios";
import API_URL from "../environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const HomePage = () => {
  const [openBuy, setOpenBuy] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);
  const [username, setUsername] = useState("...");
  const navigate = useNavigate(); // Correctly get the history object

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //treba getBalance
  // get assets and show them in the table

  const getUsername = () => {
    const token = localStorage.getItem("token");

    axios
      .get(API_URL + "get-user", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + token,
        },
      })
      .then((response) => {
        setUsername(response.data.username);
      });
  };

  useEffect(() => {
    getUsername();
  });

  const logout = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        API_URL + "logout/",
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + token,
          },
        },
      );
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.log("Logout failed", error);
    }
  };

  const getPublicKey = () => {
    const secretKeyStr = localStorage.getItem("secretKey");
    if (!secretKeyStr) {
      return "No secret key found in localStorage";
    }
    // Convert the base64-encoded string to Uint8Array
    try {
      const secretKey = Uint8Array.from(Buffer.from(secretKeyStr, "base64"));
      const keypair = Keypair.fromSecretKey(secretKey);
      return keypair.publicKey.toString();
    } catch (error) {
      return "Failed to decode the secret key";
    }
  };

  const adaptPublicKey = () => {
    const publicKey = getPublicKey();
    return `${publicKey.toString().slice(0, 5)}...${publicKey.toString().slice(-5)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getPublicKey());
    } catch (err) {
      alert("Failed to copy text");
    }
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

  function handleClickOpenTransactions() {
    setOpenTransactions(true);
  }

  function handleCloseTransactions() {
    setOpenTransactions(false);
  }

  return (
    <div className="text-yellow-500">
      <div className="nav-bar flex justify-between items-center p-4 px-20 bg-gray-800 w-full">
        <Link to="/home" className="logo text-2xl font-bold">
          PAG
        </Link>
        <div className="nav-links space-x-6">
          <Link
            to="#"
            onClick={handleClickOpenTransactions}
            className="hover:text-gray-300"
          >
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
        <div className="flex items-center space-x-4">
          <div className="max-w-l px-4">{username}</div>
          <button onClick={logout} className="hover:text-gray-300">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
      <div className="home-page bg-gray-900 text-yellow-500 min-h-screen px-20">
        <div className="main-content p-6">
          <h3 className="text-xl mb-1">Balance</h3>
          <div className="balance-holder flex items-baseline">
            <h1 className="text-4xl font-bold">$</h1>
            <h1 className="text-4xl font-bold">0.00</h1>
          </div>
          <div>
            <div className="text-right">
              <div className="text-gray-400 flex items-center">
                <div className="py-2 flex">
                  <p className="mr-2">{adaptPublicKey()}</p>
                  <button
                    onClick={copyToClipboard}
                    className="text-yellow-500 hover:underline"
                  >
                    COPY
                  </button>
                </div>
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
                        <p className="text-sm ">SOL</p>
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
        <TransactionsDialog
          open={openTransactions}
          handleClose={handleCloseTransactions}
        />
      </div>
    </div>
  );
};

export default HomePage;
