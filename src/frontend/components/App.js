import { BrowserRouter, Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./Navbar";
import { ethers } from "ethers";
import { useState } from "react";
import MarketplaceAbi from "../contractsData/MarketPlace.json";
import MarketplaceAdress from "../contractsData/MarketPlace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import Create from "./Create";
import Home from "./Home";
import MyListedItem from "./MyListedItem";
import MyPurchases from "./MyPurchases";
import { Spinner } from "react-bootstrap";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNFt] = useState({});
  const [marketplace, setMarketplace] = useState({});
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    loadContracts(signer);
  };
  const loadContracts = async (signer) => {
    const marketplace = new ethers.Contract(
      MarketplaceAdress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFt(nft);
    setLoading(false);
  };
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting Metamask Connection... </p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItem
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
