'use client';

import { useEffect, useState } from 'react';
import { web3, initializeWeb3 } from './web3';

export default function ConnectWallet() {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        async function setup() {
            if (!web3) {
                await initializeWeb3();
            }
            connectWallet();
        }

        setup();
    }, []);

    async function connectWallet() {
        try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                const balanceWei = await web3.eth.getBalance(accounts[0]);
                setBalance(web3.utils.fromWei(balanceWei, 'ether'));
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    }

    return (
        <div>
            {account ? (
                <div id="walletInfo">
                    <p id="walletAddress">Connected Account: {account}</p>
                    <p id="walletBalance">Balance: {balance} ETH</p>
                </div>
            ) : (
                <button onClick={connectWallet} id="connectWalletButton">
                    Connect Wallet
                </button>
            )}
        </div>
    );
}
