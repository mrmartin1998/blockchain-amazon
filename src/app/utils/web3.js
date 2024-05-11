'use client';

import Web3 from 'web3';
import AmazonArtifact from '/build/contracts/Amazon.json';

let web3;
let Amazon;

const contractAddress = "0x7489421543bB62BCF38cbBAE028c986D53200Ea8";

export function initializeWeb3() {
  if (typeof window !== 'undefined') {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          web3 = new Web3(window.ethereum);
          Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
          console.log(`Account detected and connected: ${accounts[0]}`);
          console.log('Smart contract is ready to interact with.');
        })
        .catch((error) => {
          console.error('User denied account access', error);
        });
    } else if (window.web3) {
      web3 = new Web3(window.web3.currentProvider);
      Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
      web3.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          console.log(`Legacy Metamask account detected and connected: ${accounts[0]}`);
          console.log('Smart contract is ready to interact with.');
        } else {
          console.error('No legacy Metamask account detected.');
        }
      });
    } else {
      web3 = new Web3('http://127.0.0.1:7545');
      Amazon = new web3.eth.Contract(AmazonArtifact.abi, contractAddress);
      console.log('No Metamask detected. Falling back to local Ganache network.');
      web3.eth.getAccounts().then((accounts) => {
        if (accounts.length > 0) {
          console.log(`Ganache account detected and connected: ${accounts[0]}`);
          console.log('Smart contract is ready to interact with.');
        } else {
          console.error('No Ganache account detected.');
        }
      });
    }
  }
}

initializeWeb3();

export { web3, Amazon };
