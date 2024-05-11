'use client';

import { useState, useEffect } from 'react';
import { web3 } from './web3';

export default function ConnectWallet() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const balanceWei = await web3.eth.getBalance(accounts[0]);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      setBalance(balanceEth);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });
    }
  }, []);

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
