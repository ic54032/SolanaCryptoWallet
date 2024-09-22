import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction} from "@solana/web3.js";

interface SendDialogProps {
    open: boolean;
    handleClose: () => void;
}

const SendDialog: React.FC<SendDialogProps> = ({ open, handleClose }) => {
    const [amount, setAmount] = useState<string>('0');
    const [recipient, setRecipient] = useState<string>('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'amount' | 'recipient') => {
        const value = e.target.value;
        if (field === 'amount') {
            setAmount(value);
        } else {
            setRecipient(value);
        }
    };

    const sendSol = async (amount: number, recipient: string) => {
        const secretKeyString = "3,15,81,223,228,22,249,246,245,45,154,52,24,231,114,240,131,11,230,24,147,57,57,202,120,210,177,127,122,65,209,127,231,170,97,215,16,114,205,153,189,173,5,87,215,85,95,168,117,207,95,17,160,166,153,184,239,205,51,172,178,137,163,7";
        if (!secretKeyString) {
            throw new Error("SECRET_KEY is not defined");
        }

        if (!recipient) {
            throw new Error("Recipient address is required");
        }

        const secretKey = Uint8Array.from(secretKeyString.split(',').map(Number));

        const senderKeypair = Keypair.fromSecretKey(secretKey);

        const senderPublicKey = senderKeypair.publicKey;
        const recieverPubkey = new PublicKey(recipient);
        console.log(`senderKeypair: ${senderPublicKey.toBase58()}`);

        const connection = new Connection("https://api.devnet.solana.com", "confirmed");

        const transaction = new Transaction();

        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey: senderPublicKey,
            toPubkey: recieverPubkey,
            lamports: amount,
        });

        transaction.add(sendSolInstruction);

        const signature = sendAndConfirmTransaction( connection, transaction, [ senderKeypair ]);

        console.log(
            `💸 Finished! Sent ${amount} to the address ${recieverPubkey}. `,
        );
        console.log(`Transaction signature is ${signature}!`);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white p-6">
                <DialogTitle className="text-xl font-semibold mb-6">Send Token</DialogTitle>

                <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <label className="text-sm text-gray-400">Amount</label>
                        <div className="flex justify-between items-center mt-1">
                            <input
                                type="text"
                                value={amount}
                                onChange={(e) => handleInputChange(e, 'amount')}
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
                                onChange={(e) => handleInputChange(e, 'recipient')}
                                className="bg-transparent text-xl font-semibold focus:outline-none w-full"
                                placeholder="Search or paste"
                            />
                        </div>
                    </div>

                    {parseFloat(amount) < 0.01 && (
                        <div className="text-sm text-red-500 bg-red-900 bg-opacity-50 p-2 rounded">
                            Insufficient SOL. Please ensure you have at least 0.01 SOL in your wallet to cover network fees.
                        </div>
                    )}
                </div>

                <DialogActions className="mt-6 justify-center">
                    <button onClick={()=>sendSol(parseFloat(amount),recipient)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded" disabled={parseFloat(amount) < 0.01}>
                        Send SOL
                    </button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};

export default SendDialog;