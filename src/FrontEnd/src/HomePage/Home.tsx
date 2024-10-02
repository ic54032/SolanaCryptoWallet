import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BuyDialog from "../BuyDialog/Buy";
import SendDialog from "../SendDialog/Send";
import TransactionsDialog from "../TransactionsDialog/Transactions";
import AssetsDiv from "../Assets/AssetsDiv";
import axios from "axios";
import API_URL from "../environment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { getSecretKey } from "../cryptoUtils";
import { Keypair } from "@solana/web3.js";
import SolanaTokenCreationForm from "../TokenCreation/TokenCreation";

const HomePage = () => {
  const [openBuy, setOpenBuy] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [openTransactions, setOpenTransactions] = useState(false);
  const [openTokenCreation, setOpenTokenCreation] = useState(false);
  const [username, setUsername] = useState("...");
  const navigate = useNavigate();

  const secretKey = getSecretKey();
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey;

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

  const adaptPublicKey = () => {
    return `${publicKey.toString().slice(0, 5)}...${publicKey.toString().slice(-5)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicKey.toString());
    } catch (err) {
      alert("Failed to copy text");
    }
  };

  const handleClickOpenBuy = () => {
    setOpenBuy(true);
  };

  const handleCloseBuy = () => {
    window.location.reload();
    setOpenBuy(false);
  };

  const handleClickOpenSend = () => {
    setOpenSend(true);
  };

  const handleCloseSend = () => {
    window.location.reload();
    setOpenSend(false);
  };

  function handleClickOpenTransactions() {
    setOpenTransactions(true);
  }

  function handleCloseTransactions() {
    setOpenTransactions(false);
  }

  function handleClickOpenTokenCreation() {
    setOpenTokenCreation(true);
  }

  function handleCloseTokenCreation() {
    setOpenTokenCreation(false);
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
          <Link
            to="#"
            onClick={handleClickOpenTokenCreation}
            className="hover:text-gray-300"
          >
            Create Token
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <div className="max-w-l px-4">{username}</div>
          <button onClick={logout} className="hover:text-gray-300">
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
      <div className="bg-gray-900 text-yellow-500 min-h-screen px-20">
        <div className="main-content p-6">
          <h3 className="text-xl mb-1">Balance</h3>
          <div className="balance-holder flex items-baseline">
            <h1 className="text-4xl font-bold">€</h1>
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
        <AssetsDiv />
        <BuyDialog open={openBuy} handleClose={handleCloseBuy} />
        <SendDialog open={openSend} handleClose={handleCloseSend} />
        <TransactionsDialog
          open={openTransactions}
          handleClose={handleCloseTransactions}
        />
        <SolanaTokenCreationForm
          open={openTokenCreation}
          handleClose={handleCloseTokenCreation}
        />
      </div>
    </div>
  );
};

export default HomePage;
