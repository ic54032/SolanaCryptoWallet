import React, { useEffect, useState } from "react";
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";
import { Buffer } from "buffer";
import axios from "axios";
import API_URL from "../environment";
import { useNavigate } from "react-router-dom";

window.Buffer = Buffer;

const CryptoWalletAuth = () => {
  const [activeTab, setActive] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState([] as string[]);
  const [confirmSeedPhrase, setConfirmSeedPhrase] = useState([] as string[]);
  const [recoveryPhrase, setRecoveryPhrase] = useState([] as string[]);
  const [lastActiveTab, setlastActiveTab] = useState("login");
  const [showRecoveryPhraseError, setShowRecoveryPhraseError] = useState(false);
  const [showPasswordMismatchError, setShowPasswordMismatchError] =
    useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showRecoveryPhraseInvalid, setShowRecoveryPhraseInvalid] =
    useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const navigate = useNavigate();
  const [showUserNotFoundError, setShowUserNotFoundError] = useState(false);

  useEffect(() => {
    const mnemonic: string = bip39.generateMnemonic();
    setSeedPhrase(mnemonic.split(" "));
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase.join(" "));
    } catch (err) {
      alert("Failed to copy text");
    }
  };

  function setActiveTab(tab: string) {
    setlastActiveTab(activeTab);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setActive(tab);
  }

  function changeToLastActiveTab() {
    setActive(lastActiveTab);
  }

  function updateConfirmSeedPhrase(index: number, value: string) {
    confirmSeedPhrase[index] = value;
    setConfirmSeedPhrase([...confirmSeedPhrase]);
  }

  function updateRecoveryPhrase(index: number, value: string) {
    recoveryPhrase[index] = value;
    setRecoveryPhrase([...recoveryPhrase]);
  }

  function pasteFromClipboard() {
    navigator.clipboard.readText().then((text) => {
      const words = text.split(" ");
      if (words.length !== 12) {
        alert("Recovery phrase must be 12 words long!");
        return;
      }
      if (activeTab === "confirm") {
        setConfirmSeedPhrase(words);
      } else {
        setRecoveryPhrase(words);
      }
    });
  }

  function checkSeedPhase() {
    if (seedPhrase.join(" ") === confirmSeedPhrase.join(" ")) {
      setActiveTab("create-finish");
    } else {
      setShowRecoveryPhraseError(true);
    }
  }

  function keypairFromRecoveryPhrase(recoveryPhrase: string) {
    const seed = bip39.mnemonicToSeedSync(recoveryPhrase);
    const seedBuffer = seed.subarray(0, 32);
    return Keypair.fromSeed(seedBuffer);
  }

  function login() {
    const data = {
      username: username,
      password: password,
    };
    console.log(username);

    axios
      .post(API_URL + "login", data)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("secretKey", response.data.private_key);
        navigate("/home", { state: { username: username } });
      })
      .catch((_error) => {
        setShowUserNotFoundError(true);
      });
  }

  function signUp() {
    const keypair = keypairFromRecoveryPhrase(seedPhrase.join(" "));
    const keypairString = Buffer.from(keypair.secretKey).toString("base64");
    localStorage.setItem("secretKey", keypairString);

    // ZA DOHVACANJE SECRET KEYA IZ LOCAL STORAGEA: secretKeyString = localStorage.getItem("secretKey");
    // Uint8Array.from(Buffer.from(secretKeyString, "base64"))

    const data = {
      username: username,
      password: password,
      private_key: keypairString,
    };

    axios
      .post(API_URL + "signup", data)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        navigate("/home", { state: { username: username } });
      })
      .catch((error) => {
        if (error.response.data.error === "Username already exists") {
          setShowUsernameError(true);
          setShowPasswordError(false);
          setShowPasswordMismatchError(false);
        }
      });
  }

  function recoverWallet() {
    const keypair = keypairFromRecoveryPhrase(recoveryPhrase.join(" "));
    const keypairString = Buffer.from(keypair.secretKey).toString("base64");
    localStorage.setItem("secretKey", keypairString);

    const data = {
      password: password,
      private_key: keypairString,
    };

    axios
      .post(API_URL + "recover", data)
      .then((response) => {
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      })
      .catch((error) => {
        console.error("Error", error);
      });
  }

  function checkUsernameAndPassword() {
    if (password !== confirmPassword) {
      setShowPasswordMismatchError(true);
      setShowPasswordError(false);
      return;
    }
    if (password.length < 8) {
      setShowPasswordError(true);
      setShowPasswordMismatchError(false);
      return;
    }
    if (activeTab === "recover-finish") {
      recoverWallet();
    } else {
      signUp();
    }
  }

  function checkRecoveryPhase() {
    if (!bip39.validateMnemonic(recoveryPhrase.join(" "))) {
      setShowRecoveryPhraseInvalid(true);
      return;
    }
    const keypair = keypairFromRecoveryPhrase(recoveryPhrase.join(" "));

    axios
      .post(API_URL + "check-public-key", {
        public_key: JSON.stringify(Array.from(keypair.publicKey.toBytes())),
      })
      .then((_response) => {
        setShowRecoveryPhraseInvalid(false);
        setActiveTab("recover-finish");
      })
      .catch((_error) => {
        console.error("Error", _error);
        setShowRecoveryPhraseInvalid(true);
      });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-bold">PAG</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "login" ? "bg-yellow-500 text-black" : "bg-gray-700"}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "create" || activeTab === "confirm" || activeTab === "create-finish" ? "bg-yellow-500 text-black" : "bg-gray-700"}`}
            onClick={() => setActiveTab("create")}
          >
            Create a wallet
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === "recover" || activeTab === "recover-finish" ? "bg-yellow-500 text-black" : "bg-gray-700"}`}
            onClick={() => setActiveTab("recover")}
          >
            Recover a wallet
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full">
          {activeTab === "login" ? (
            <div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="username" className="block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md mb-2"
                  />
                </div>
              </form>
              {showUserNotFoundError && (
                <span className="text-red-700">
                  Invalid username or password!
                </span>
              )}
              <div className="mt-2 text-center">
                <span
                  onClick={() => setActiveTab("recover")}
                  className="text-yellow-500 hover:underline hover:cursor-pointer"
                >
                  Forgot your password?
                </span>
              </div>
              <button
                onClick={login}
                className="w-full mt-6 bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition"
              >
                Login
              </button>
            </div>
          ) : activeTab === "create" ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Write down your recovery phrase
              </h2>
              <p className="text-gray-400 mb-4">
                You will need it on the next step
              </p>
              <div className="bg-gray-800 p-4 rounded-md mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {seedPhrase.map((word, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-yellow-500 mr-2 w-6">
                        {index + 1}
                      </span>
                      <span className="px-1 py-1 mx-2">{word}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={copyToClipboard}
                    className="text-yellow-500 hover:underline"
                  >
                    COPY
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveTab("confirm")}
                  className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600 transition w-full text-black"
                >
                  I SAVED MY RECOVERY PHRASE
                </button>
              </div>
              <footer className="mt-8 text-center text-gray-400">
                <span
                  onClick={() => setActiveTab("recover")}
                  className="text-yellow-500 hover:underline hover:cursor-pointer"
                >
                  Already have a wallet? Access it here
                </span>
              </footer>
            </div>
          ) : activeTab === "confirm" ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Confirm your recovery phrase
              </h2>
              <p className="text-gray-400 mb-4">
                Don't share your recovery phrase with anyone!
              </p>
              <div className="bg-gray-800 p-4 rounded-md mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {seedPhrase.map((_word, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-yellow-500 mr-2 w-6">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        id={`word-${index}`}
                        value={confirmSeedPhrase[index] || ""}
                        onInput={(e) =>
                          updateConfirmSeedPhrase(index, e.currentTarget.value)
                        }
                        className="w-full px-3 py-1 mx-2 bg-gray-800 rounded-md input-no-bg-change"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={pasteFromClipboard}
                    className="text-yellow-500 hover:underline"
                  >
                    PASTE
                  </button>
                  {showRecoveryPhraseError && (
                    <span className="text-red-700">
                      Recovery phrases don't match!
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setActiveTab("create")}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                  BACK
                </button>
                <button
                  onClick={() => checkSeedPhase()}
                  className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600 transition text-black"
                >
                  CONTINUE
                </button>
              </div>
              <footer className="mt-8 text-center text-gray-400">
                <span
                  onClick={() => setActiveTab("recover")}
                  className="text-yellow-500 hover:underline hover:cursor-pointer"
                >
                  Already have a wallet? Access it here
                </span>
              </footer>
            </div>
          ) : activeTab === "create-finish" ? (
            <div>
              <form className="space-y-4">
                <div>
                  <label htmlFor="username" className="block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md mb-2"
                  />
                </div>
              </form>
              {showPasswordMismatchError && (
                <span className="text-red-700 py-2">
                  Passwords don't match!
                </span>
              )}
              {showPasswordError && (
                <span className="text-red-700 w-full">
                  Password must be at least 8 characters long!
                </span>
              )}
              {showUsernameError && (
                <span className="text-red-700 w-full">
                  Username already exists!
                </span>
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => changeToLastActiveTab()}
                  className="mt-6 px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                  BACK
                </button>
                <button
                  onClick={checkUsernameAndPassword}
                  className="mt-6 bg-yellow-500 text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition"
                >
                  Create Wallet
                </button>
              </div>
            </div>
          ) : activeTab === "recover" ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Enter your recovery phrase
              </h2>
              <p className="text-gray-400 mb-4">
                Recovery phrase is the key to your wallet!
              </p>
              <div className="bg-gray-800 p-4 rounded-md mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {seedPhrase.map((_word, index) => (
                    <div key={index} className="flex items-center">
                      <span className="text-yellow-500 mr-2 w-6">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        id={`word-${index}`}
                        value={recoveryPhrase[index] || ""}
                        onInput={(e) =>
                          updateRecoveryPhrase(index, e.currentTarget.value)
                        }
                        className="w-full px-3 py-1 mx-2 bg-gray-800 rounded-md input-no-bg-change"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={pasteFromClipboard}
                    className="text-yellow-500 hover:underline"
                  >
                    PASTE
                  </button>
                  {showRecoveryPhraseInvalid && (
                    <span className="text-red-700">
                      Invalid recovery phrase!
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => changeToLastActiveTab()}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                  BACK
                </button>
                <button
                  onClick={checkRecoveryPhase}
                  className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600 transition text-black"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Set a password for your wallet
              </h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="password" className="block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md mb-2"
                  />
                </div>
              </form>
              {showPasswordMismatchError && (
                <span className="text-red-700 py-2">
                  Passwords don't match!
                </span>
              )}
              {showPasswordError && (
                <span className="text-red-700 w-full">
                  Password must be at least 8 characters long!
                </span>
              )}
              <div className="flex justify-between my-2">
                <button
                  onClick={() => changeToLastActiveTab()}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
                >
                  BACK
                </button>
                <button
                  onClick={checkUsernameAndPassword}
                  className="px-4 py-2 bg-yellow-500 rounded-md hover:bg-yellow-600 transition text-black"
                >
                  RECOVER WALLET
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CryptoWalletAuth;
