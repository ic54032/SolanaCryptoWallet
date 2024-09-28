import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { getBalance, EXCHANGE_RATE, publicKey } from "../cryptoUtils";
const AssetsDiv = () => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance();
      setBalance(balance);
      const connection = new Connection("https://api.devnet.solana.com");
      const filter = {
        programId: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
      };
      console.log(await connection.getTokenAccountsByOwner(publicKey, filter));
    };
    fetchBalance();
  }, []);

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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetsDiv;
