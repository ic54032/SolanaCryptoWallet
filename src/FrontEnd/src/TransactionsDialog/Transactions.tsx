import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransactionResponse,
} from "@solana/web3.js";
import { Search, X } from "lucide-react";
import { CardContent, IconButton, Input, Pagination } from "@mui/material";

interface TransactionsDialogProps {
  open: boolean;
  handleClose: () => void;
}

interface Transaction {
  sender: string;
  recipient: string;
  time: string;
  value: number;
  token: string;
}

const TransactionCard = (transaction: Transaction) => (
  <div className="mb-4 w-full rounded-lg">
    <CardContent className="p-4 bg-gray-800 text-white rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold mr-20">From: {transaction.sender}</span>
        <span className="text-sm text-gray-500">{transaction.time}</span>
      </div>
      <div className="mb-2 font-semibold">To: {transaction.recipient}</div>
      <div className="flex justify-between items-center">
        <span className="font-bold">
          {transaction.value} {transaction.token}
        </span>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {transaction.token}
        </span>
      </div>
    </CardContent>
  </div>
);

const TransactionsDialog: React.FC<TransactionsDialogProps> = ({
  open,
  handleClose,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const transactionsPerPage = 3;

  useEffect(() => {
    const secretKeyString = localStorage.getItem("secretKey");
    if (!secretKeyString) {
      throw new Error("SECRET_KEY is not defined");
    }
    const secretKey = Uint8Array.from(Buffer.from(secretKeyString, "base64"));
    const keypair = Keypair.fromSecretKey(secretKey);
    console.log(keypair.publicKey.toString());
    getTransactions(keypair.publicKey.toString()).then((r) => console.log(r));
  }, []);

  async function mapTransaction(
    transaction: VersionedTransactionResponse | null,
    connection: Connection,
  ) {
    if (
      !transaction ||
      !transaction.transaction ||
      !transaction.transaction.message ||
      !transaction.meta ||
      !transaction.meta.preBalances ||
      !transaction.meta.postBalances ||
      !transaction.transaction.message.getAccountKeys() ||
      !transaction.transaction.message.getAccountKeys().get(0) ||
      !transaction.transaction.message.getAccountKeys().get(1) ||
      !transaction.slot
    ) {
      return null;
    }
    const accountKeys = transaction.transaction.message.getAccountKeys();
    if (!accountKeys) {
      return null;
    }

    const senderKey = accountKeys.get(0);
    const recipientKey = accountKeys.get(1);
    if (!senderKey || !recipientKey) {
      return null;
    }

    const time = await connection.getBlockTime(transaction.slot);

    return {
      sender: senderKey.toBase58(),
      recipient: recipientKey.toBase58(),
      time: time ? new Date(time * 1000).toLocaleString() : "Unknown",
      value:
        (transaction.meta.preBalances[0] - transaction.meta.postBalances[0]) /
        1e9,
      token: "SOL",
    };
  }

  const getTransactions = async (walletAddress: string) => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed",
      );

      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      const transactions = await Promise.all(
        signatures.map(async (signatureInfo) => {
          return await connection.getTransaction(signatureInfo.signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 2,
          });
        }),
      );

      const mappedTransactions = await Promise.all(
        transactions.map((transaction) => {
          return mapTransaction(transaction, connection);
        }),
      );

      const filteredTransactions = mappedTransactions.filter(
        (transaction): transaction is NonNullable<typeof transaction> =>
          transaction !== null && transaction !== undefined,
      );

      setTransactions(filteredTransactions);
      console.log(filteredTransactions);
    } catch (error) {
      console.error("Greška kod dohvaćanja transakcija:", error);
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.sender.includes(searchTerm) ||
      transaction.recipient.includes(searchTerm),
  );

  const pageCount = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  const displayedTransactions = filteredTransactions.slice(
    (page - 1) * transactionsPerPage,
    page * transactionsPerPage,
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      fullWidth={true}
      sx={{
        "& .MuiDialog-paper": {
          width: "80%",
          height: "80%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <DialogContent className="flex flex-col h-full bg-gray-900 text-white p-6">
        <div className="absolute right-8">
          <IconButton onClick={handleClose}>
            <X className="text-white" size={24} />
          </IconButton>
        </div>
        <DialogTitle className="text-xl font-semibold mb-6 pt-0">
          Transactions
        </DialogTitle>
        <div className="relative mb-4 w-full pr-4">
          <Input
            type="text"
            value={searchTerm}
            placeholder="Search"
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 w-full rounded-lg"
            sx={{
              "&::placeholder": { color: "white" },
              color: "white",
            }}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500"
            size={18}
          />
        </div>
        <div className="flex-grow overflow-auto rounded-lg pr-4">
          {displayedTransactions.map((transaction, index) => (
            <TransactionCard key={index} {...transaction} />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "white",
              },
              "& .MuiPaginationItem-page.Mui-selected": {
                backgroundColor:
                  "--tw-bg-opacity: 1;background-color: rgb(31 41 55 / var(--tw-bg-opacity))",
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionsDialog;
