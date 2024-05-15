'use client';

import Web3 from 'web3';
import AmazonArtifact from '/build/contracts/Amazon.json';

let web3 = null;
let Amazon = null;
let initializationPromise = null;

const contractAddress = "0x471ABF0e77D49E2d7eD1e54A194feDbdf04ae8c7";

function initializeWeb3() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      if (typeof window !== 'undefined') {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          web3 = new Web3(window.ethereum);
          Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
          console.log(`Account detected and connected: ${await web3.eth.getAccounts()[0]}`);
          console.log('Smart contract is ready to interact with.');
        } else if (window.web3) {
          web3 = new Web3(window.web3.currentProvider);
          Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
          console.log('Using old web3 provider.');
        } else {
          throw new Error('No Ethereum browser extension detected.');
        }
      }
    })();
  }
  return initializationPromise;
}

export { web3, Amazon, initializeWeb3 };
