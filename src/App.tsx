import "./App.css";
import React, { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import detectEthereumProvider from '@metamask/detect-provider'
import { loadContract } from "./utils/load-contract";
import metamaskImg from "./assets/metamask.png";




function App() {

  interface Web3Object {
    provider: any;
    isProviderLoaded: boolean;
    web3: any;
    contract: any;
    setWeb3Api?: React.Dispatch<React.SetStateAction<Web3Object>>;
  }

  const [web3Api, setWeb3Api] = useState<Web3Object>({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null,
  })

  const [balance, setBalance] = useState(null);

  const [account, setAccount] = useState(null);

  const [shouldReload, setSholdReload] = useState(false);

  const canConnectToContract = account && web3Api.contract;

  const reloadEffect = useCallback(() => setSholdReload(!shouldReload), [shouldReload]);

  const setAccountListener = (provider: any) => {
    // provider.on("accountsChanged",(accounts: any) => setAccount(accounts[0]));
    provider.on("accountsChanged", ( _ : any )=> window.location.reload());
    provider.on("chainChanged", ( _ : any )=> window.location.reload());

    // provider._jsonRpcConnection.events.on("notification", (payload: any) =>{
    //   const {method}= payload;
    //   if(method === "metamask_unlockStateChanged"){
    //     setAccount(null);
    //   }
    // });
  }
  
  useEffect(() => {

    const loadProvider = async () => {
      // with Metamask we have access to window.ethereum and window.web3
      // Metamask injects a global API into website
      // this API allows websites to request users, accounts, read data to the blockchain
      // sign messages and transactions
      const provider: any = await detectEthereumProvider();
      

      // console.log(contract)
      if(provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          provider: provider,
          web3: new Web3(provider),
          isProviderLoaded: true,
          contract: contract,
        });
      } else {
        setWeb3Api((api: Web3Object) => {
          return {
            ...api,
            isProviderLoaded: true,
          }
        });
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
  }, [web3Api, shouldReload]);

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
    web3Api.web3 && getAccounts();
  }, [web3Api.web3]);

  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    });
    reloadEffect();
  }, [web3Api, account, reloadEffect]);

  const withdraw = async () => {
    const {contract, web3} = web3Api;
    const withdrawAmount = web3.utils.toWei("0.1", "ether");
    await contract.withdraw(withdrawAmount,{
      from: account,
    });
    reloadEffect();
  }
 
  return (
    <>
      
      <div className="faucet-wrapper">
        <div className="faucet">
        <img src={metamaskImg} width="250" alt="metamask fox" className="my-6 metamask-style" />
          { web3Api.isProviderLoaded ?
            <div className="is-flex is-align-items-center">
              <span>
                <strong className="mr-2">Account:</strong>
              </span>
                {account ? 
                <div> {account}</div> : 
                !web3Api.provider ?
                <>
                  <div className="notification is-warning is-small is-rounded">
                    Wallet is not detected!{`  `}
                    <a className="is-block" rel="noreferrer" target="_blank" href="https://docs.metamask.io">
                      Install Metamask
                    </a>

                  </div>
                </>
                :
                <button 
                  className="button is-danger mr-2 is-small"
                  onClick={() => {web3Api.provider.request({method: "eth_requestAccounts"})}} 
                >
                  Connect Wallet
                </button>
                }
            </div> :
            <span>Looking for Web3</span>
          }
          <div className="balace view is-size-2 my-4">
            Current Balance: <strong>{balance}</strong> ETH
          </div>
          {
            !canConnectToContract &&
            <i className="is-block">
              Connect to Ganache
            </i>
          }
          <button
          disabled={!canConnectToContract} 
            onClick={addFunds}
            className="button is-link mr-2">
              Donate 1 Eth
          </button>
          <button disabled={!canConnectToContract} className="button is-primary" onClick={withdraw}>Withdraw</button>
        </div>
      </div>

    </>
  );
}

export default App;

