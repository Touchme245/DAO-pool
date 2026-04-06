"use client";

import React from "react";
import Link from "next/link";
import { FiUser, FiDatabase } from "react-icons/fi";
import { useWallet } from "../context/WalletContext";

export default function Header() {
    const { account, connectWallet } = useWallet();

    return (
        <header className="w-full flex justify-between items-center py-6 px-6 md:px-12 bg-purpleDark/10 backdrop-blur-sm shadow-none">
            <Link
                href="/"
                className="text-2xl md:text-3xl font-bold text-purpleLight flex items-center hover:text-purpleLight/80 transition-colors duration-200"
            >
                <FiDatabase className="mr-2" /> Dao Invest
            </Link>

            {!account ? (
                <button
                    onClick={connectWallet}
                    className="px-5 py-2 bg-purple/70 hover:bg-purpleLight/80 rounded-lg font-semibold transition-colors duration-200"
                >
                    Подключить кошелек
                </button>
            ) : (
                <div className="flex items-center space-x-3 bg-purpleDark/20 px-4 py-2 rounded-lg">
                    <FiUser className="text-purpleLight" />
                    <span className="font-mono text-purple-200">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <Link
                        href="/token"
                        className="ml-4 text-purpleLight font-semibold hover:text-purpleLight/80 transition-colors duration-200"
                    >
                        Управление токенами
                    </Link>
                </div>
            )}
        </header>
    );
}
