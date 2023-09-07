import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractAbi, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
    );
    return transactionContract;
};

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccounts] = useState("");
    const [formData, setformData] = useState({
        addressTo: "",
        amount: "",
        keyword: "",
        message: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, settransactionCount] = useState(
        localStorage.getItem("transactionCount")
    );
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setformData((prevState) => ({
            ...prevState,
            [name]: e.target.value,
        }));
    };

    const getAllTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            const transactionContract = getEthereumContract();
            const availableTransaction =
                await transactionContract.getAllTransaction();

            const structuredTransaction = availableTransaction.map(
                (transaction) => ({
                    addressTo: transaction.reciever,
                    addressFrom: transaction.sender,
                    timestamp: new Date(
                        transaction.timestamp.toNumber() * 1000
                    ).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount._hex) / 10 ** 18,
                })
            );
            setTransactions(structuredTransaction);
            console.log(structuredTransaction);
        } catch (error) {
            console.log(error);
        }
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccounts(accounts[0]);
                getAllTransaction();
            } else {
                console.log("No accounts found");
            }
            console.log(accounts);
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object");
        }
    };

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount =
                await transactionContract.getTransactionCount();
            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            throw new Error("No Ethereum Object");
        }
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            });
            setCurrentAccounts(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object");
        }
    };

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install metamask");
            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parseAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: "0x5208", //21000 Gwei
                        value: parseAmount._hex,
                    },
                ],
            });
            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parseAmount,
                message,
                keyword
            );

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount =
                await transactionContract.getTransactionCount();

            settransactionCount(transactionCount.toNumber());

            location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No Ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                setformData,
                handleChange,
                sendTransaction,
                transactions,
                isLoading,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
