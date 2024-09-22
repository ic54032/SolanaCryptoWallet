import React, {useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import './Buy.css';
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

interface BuyDialogProps {
    open: boolean;
    handleClose: () => void;
}

const BuyDialog: React.FC<BuyDialogProps> = ({ open, handleClose }) => {
    const [spendAmount, setSpendAmount] = useState('100');
    const [receiveAmount, setReceiveAmount] = useState('0.74692441');
    const EXCHANGE_RATE = 133.88;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'spend' | 'receive') => {
        const value = e.target.value;
        if (type === 'spend') {
            setSpendAmount(value);
            setReceiveAmount((parseFloat(value) / EXCHANGE_RATE).toFixed(8));
        } else {
            setReceiveAmount(value);
            setSpendAmount((parseFloat(value) * EXCHANGE_RATE).toFixed(2));
        }
    };

    const requestAndConfirmAirdrop = async (connection:Connection, publicKey:PublicKey, amount:number) => {
        const airdropTransactionSignature = await connection.requestAirdrop(publicKey, amount);
        // Wait for airdrop confirmation
        const latestBlockHash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: airdropTransactionSignature,
            },

            "finalized");
        return connection.getBalance(publicKey, "finalized");
    };

    const airdropIfRequired = async (connection:Connection, publicKey:PublicKey, airdropAmount:number, minimumBalance:number) => {
        const balance = await connection.getBalance(publicKey, "confirmed");
        if (balance < minimumBalance) {
            return requestAndConfirmAirdrop(connection, publicKey, airdropAmount);
        }
        console.log("Balance is sufficient. No airdrop required.");
        return balance;
    };

    async function airdropSolana(amount: number) {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        const secretKeyString = "3,15,81,223,228,22,249,246,245,45,154,52,24,231,114,240,131,11,230,24,147,57,57,202,120,210,177,127,122,65,209,127,231,170,97,215,16,114,205,153,189,173,5,87,215,85,95,168,117,207,95,17,160,166,153,184,239,205,51,172,178,137,163,7";
        if (!secretKeyString) {
            throw new Error("SECRET_KEY is not defined in the .env file");
        }

        const secretKey = Uint8Array.from(secretKeyString.split(',').map(Number));

        // Create a Keypair from the secret key
        const userKeypair = Keypair.fromSecretKey(secretKey);

        const status = await airdropIfRequired(connection, userKeypair.publicKey, amount, 0.0025 * LAMPORTS_PER_SOL);
        console.log("Airdrop status is: ", status);
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white p-6">
                <DialogTitle className="text-xl font-semibold mb-6">Buy crypto</DialogTitle>

                <div className="space-y-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <label className="text-sm text-gray-400">You spend</label>
                        <div className="flex justify-between items-center mt-1">
                            <input
                                type="text"
                                value={spendAmount}
                                onChange={(e) => handleInputChange(e, 'spend')}
                                className="bg-transparent text-xl font-semibold focus:outline-none"
                            />
                            <button className="bg-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                                <span className="mr-1">🇪🇺</span> EUR
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                        <label className="text-sm text-gray-400">You get</label>
                        <div className="flex justify-between items-center mt-1">
                            <input
                                type="text"
                                value={receiveAmount}
                                onChange={(e) => handleInputChange(e, 'receive')}
                                className="bg-transparent text-xl font-semibold focus:outline-none"
                            />
                            <button className="bg-gray-700 text-sm px-3 py-1 rounded-full flex items-center">
                                <span className="mr-1">≋</span> SOL
                            </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Solana</div>
                    </div>

                    <div className="text-sm text-gray-400 flex justify-center items-center">
                        <span>1 SOL = 133.88 EUR</span>
                    </div>
                </div>
                <DialogActions className="mt-6 justify-center">
                    <button onClick={()=>airdropSolana(parseFloat(receiveAmount))} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                        Buy SOL
                    </button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};

export default BuyDialog;