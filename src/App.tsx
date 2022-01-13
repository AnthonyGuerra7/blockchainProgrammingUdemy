import "./App.css";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";


function App() {

  interface Web3Object {
    provider: any;
    web3: any;
    contract: any;
    setWeb3Api?: React.Dispatch<React.SetStateAction<Web3Object>>;
  }

  const [web3Api, setWeb3Api] = useState<Web3Object>({
    provider: null,
    web3: null,
    contract: null,
  })

  const [balance, setBalance] = useState(null);

  const [account, setAccount] = useState(null);

  useEffect(() => {

    const loadProvider = async () => {
      // with Metamask we have access to window.ethereum and window.web3
      // Metamask injects a global API into website
      // this API allows websites to request users, accounts, read data to the blockchain
      // sign messages and transactions
      const provider: any = await detectEthereumProvider();
      const contract = await loadContract("Faucet", provider);

      // console.log(contract)
      if(provider) {
        setWeb3Api({
          provider: provider,
          web3: new Web3(provider),
          contract: contract,
        });
      } else {
        console.error("Please, install Metamask.")
      }
    }

    loadProvider();
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    }
    web3Api.web3 && loadBalance();
  }, [web3Api]);

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    web3Api.web3 && getAccounts();
  }, [web3Api.web3]);

  const addFunds = async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    });
  }

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          <div className="is-flex is-align-items-center">
            <span>
              <strong className="mr-2">Account:</strong>
            </span>
              {account ? 
              <div> {account}</div> : 
              <button 
                className="button is-danger mr-2 is-small"
                onClick={() => {web3Api.provider.request({method: "eth_requestAccounts"})}} 
              >
                Connect Wallet
              </button>
              }
          </div>
          <div className="balace view is-size-2 my-4">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          <button 
            onClick={addFunds}
            className="button is-link mr-2">
              Donate 1 Eth
          </button>
          <button className="button is-primary">Withdraw</button>
        </div>
      </div>

    </>
  );
}

export default App;
