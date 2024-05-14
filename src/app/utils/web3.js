'use client';

import Web3 from 'web3';
import AmazonArtifact from '/build/contracts/Amazon.json';

let web3;
let Amazon;

const contractAddress = "0xbDfAf0388eC35832583B5fA75A7A154147a5d520";

const initializeWeb3 = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
            web3 = new Web3(window.ethereum);
            Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
            console.log(`Account detected and connected: ${accounts[0]}`);
            console.log('Smart contract is ready to interact with.');
            resolve({ web3, Amazon });
          })
          .catch((error) => {
            console.error('User denied account access', error);
            reject(error);
          });
      } else if (window.web3) {
        web3 = new Web3(window.web3.currentProvider);
        Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
        resolve({ web3, Amazon });
      } else {
        console.error('No Ethereum browser extension detected.');
        reject('No Ethereum browser extension detected.');
      }
    }
  });
}

export { web3, Amazon, initializeWeb3 };
