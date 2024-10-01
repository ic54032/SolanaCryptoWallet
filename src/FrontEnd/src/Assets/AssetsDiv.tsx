import React, { useEffect, useState } from "react";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getBalance, EXCHANGE_RATE, getSecretKey } from "../cryptoUtils";
import { TOKEN_2022_PROGRAM_ID, getTokenMetadata } from "@solana/spl-token";
import SendTokenDialog from "../SendTokenDialog/SendToken";

export interface Metadata {
  name: string;
  symbol: string;
  amount: number;
  mint: string;
}
const AssetsDiv = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const secretKey = getSecretKey();
  const publicKey = Keypair.fromSecretKey(secretKey).publicKey;
  const connection = new Connection("https://api.devnet.solana.com");
  const [tokenList, setTokenList] = useState<Metadata[]>([]);
  const [openSendToken, setOpenSendToken] = useState(false);
  const [currentToken, setCurrentToken] = useState<Metadata | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance();
      setBalance(balance);
    };
    const fetchTokens = async () => {
      setTokenList([]);
      console.log("Fetching tokens...", tokenList);
      let response = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_2022_PROGRAM_ID,
      });

      const tempTokenList: Metadata[] = [];
      response.value.forEach((accountInfo) => {
        const mint = new PublicKey(
          accountInfo.account.data["parsed"]["info"]["mint"],
        );

        getTokenMetadata(connection, mint).then((metadata) => {
          tempTokenList.push({
            name: metadata!.name,
            symbol: metadata!.symbol,
            amount:
              accountInfo.account.data["parsed"]["info"]["tokenAmount"][
                "amount"
              ] /
              10 **
                accountInfo.account.data["parsed"]["info"]["tokenAmount"][
                  "decimals"
                ],
            mint: mint.toString(),
          });

          if (tempTokenList.length === response.value.length) {
            setTokenList(tempTokenList);
          }
        });
      });
    };
    fetchBalance();
    fetchTokens();
  }, []);

  function handleClickOpenSendToken() {
    setOpenSendToken(true);
  }

  function handleCloseSendToken() {
    window.location.reload();
    setOpenSendToken(false);
  }

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">Assets</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="pb-2">Name</th>
              <th className="pb-2">Price</th>
              <th className="pb-2">Value</th>
              <th className="pb-2">Amount</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">
                <div className="flex items-center space-x-2">
                  <div>
                    <p>Solana</p>
                    <p className="text-sm ">SOL</p>
                  </div>
                </div>
              </td>
              <td>
                <p>{EXCHANGE_RATE}</p>
              </td>
              <td>€{(EXCHANGE_RATE * (balance ?? 0)).toFixed(3)}</td>
              <td>{balance?.toFixed(5)}</td>
            </tr>
            {tokenList.map((token, index) => (
              <tr key={index}>
                <td className="py-2">
                  <div className="flex items-center space-x-2">
                    <div>
                      <p>{token.name}</p>
                      <p className="text-sm ">{token.symbol}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p>-</p>
                </td>
                <td>-</td>
                <td>{token.amount.toFixed(2)}</td>
                <td className="w-fit">
                  <button
                    onClick={() => {
                      setCurrentToken(token);
                      handleClickOpenSendToken();
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 py-3 text-white rounded"
                    tabIndex={-1}
                  >
                    Send {token.symbol}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SendTokenDialog
        open={openSendToken}
        handleClose={handleCloseSendToken}
        metadata={currentToken}
      />
    </div>
  );
};

export default AssetsDiv;
