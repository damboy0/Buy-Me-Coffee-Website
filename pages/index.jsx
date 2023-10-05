import abi from "../utils/BuyMeACoffee.json";
import { ethers } from "ethers";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x976613Bd114F659Ada18f49CD20E285c7C1e1D5e";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  //Wallet Disconnect Logic
  const disconnectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("MetaMask is not installed");
        return;
      }

      // Disconnect the user
      await ethereum.request({
        method: "eth_accounts",
        params: [],
      });

      // Clear the current account
      setCurrentAccount(null);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying small coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyLargeCoffee = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying large coffee..");
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther("0.003") }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    const { ethereum } = window;

    const fetchData = async () => {
      await isWalletConnected();
      await getMemos();
    };

    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name,
        },
      ]);
    };

    const setupEventListeners = async () => {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        buyMeACoffee.on("NewMemo", onNewMemo);
      }
    };

    fetchData();
    setupEventListeners();

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Damboy a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Buy Damboy a Coffee!</h1>

        {currentAccount ? (
          <div>
            <form>
              <div className="formgroup">
                <label>Name</label>
                <br />

                <input
                  id="name"
                  type="text"
                  placeholder="anon"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div className="formgroup">
                <label>Send Damboy a message</label>
                <br />

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                ></textarea>
              </div>
              <div>
                <button type="custom-button" onClick={buyCoffee}>
                  Send 1 Coffee for 0.001ETH
                </button>
                <br />
                <button type="button" onClick={buyLargeCoffee}>
                  Buy Large Coffee for 0.003ETH
                </button>
                <br />
                <button type="button" onClick={disconnectWallet}>
                  Disconnect Wallet
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}> Connect your wallet </button>
        )}
      </main>

      {currentAccount && <h1>Memos received</h1>}

      {currentAccount &&
        memos.map((memo, idx) => {
          return (
            <div
              key={idx}
              style={{
                border: "2px solid",
                "border-radius": "5px",
                padding: "5px",
                margin: "5px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>&quot;{memo.message}&quot;</p>
              <p>
                From: {memo.name} at {memo.timestamp.toString()}
              </p>
            </div>
          );
        })}

      <footer className={styles.footer}>
        <a
          href="https://twitter.com/only1dami"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by Damboy.Eth
        </a>
      </footer>
    </div>
  );
}
