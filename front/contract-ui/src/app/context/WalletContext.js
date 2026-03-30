"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);

    const HARDHAT_NETWORK_ID = "31337";

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("MetaMask is not installed");
            return;
        }

        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            if (!accounts[0]) return;

            const newProvider = new BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();

            const networkVersion = await window.ethereum.request({
                method: "net_version",
            });
            if (networkVersion !== HARDHAT_NETWORK_ID) {
                alert(
                    `Please connect to Hardhat network (chainId ${HARDHAT_NETWORK_ID})`
                );
                return;
            }

            setProvider(newProvider);
            setSigner(newSigner);
            setAccount(accounts[0]);
            localStorage.setItem("walletAccount", accounts[0]);
        } catch (error) {
            console.error("Failed to connect wallet:", error);
        }
    };

    // Подписка на смену аккаунта
    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = async (accounts) => {
            if (!accounts[0]) {
                setAccount(null);
                setSigner(null);
                localStorage.removeItem("walletAccount");
                return;
            }
            setAccount(accounts[0]);
            const newProvider =
                provider || new BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner(accounts[0]);
            setSigner(newSigner);
        };

        const handleChainChanged = () => window.location.reload();

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);

        return () => {
            window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
            );
            window.ethereum.removeListener("chainChanged", handleChainChanged);
        };
    }, [provider]);

    // Восстановление из localStorage
    useEffect(() => {
        const init = async () => {
            const storedAccount = localStorage.getItem("walletAccount");
            if (!storedAccount || !window.ethereum) return;

            try {
                const newProvider = new BrowserProvider(window.ethereum);
                const accounts = await newProvider.listAccounts();
                if (accounts.includes(storedAccount)) {
                    const newSigner = await newProvider.getSigner(
                        storedAccount
                    );
                    setProvider(newProvider);
                    setSigner(newSigner);
                    setAccount(storedAccount);
                } else {
                    localStorage.removeItem("walletAccount");
                }
            } catch (error) {
                console.error("Failed to restore wallet:", error);
            }
        };
        init();
    }, []);

    return (
        <WalletContext.Provider
            value={{ provider, signer, account, connectWallet }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
