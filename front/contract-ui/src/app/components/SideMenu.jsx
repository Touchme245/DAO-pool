"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    FiMenu,
    FiX,
    FiArrowRight,
    FiDatabase,
    FiLayers,
    FiFileText,
    FiTrendingUp,
    FiSettings,
} from "react-icons/fi";

import { useWallet } from "../context/WalletContext";
import { Contract } from "ethers";

import poolAbi from "../../../../contracts/InvestmentPool.json";
import poolAddressJson from "../../../../contracts/InvestmentPool-contract-address.json";

export default function SideMenu() {
    const [open, setOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const { account, signer } = useWallet();

    const toggleMenu = () => setOpen(!open);

    const linkStyle =
        "flex items-center justify-between px-5 py-4 rounded-xl bg-purpleDark/30 hover:bg-purple/50 text-purple-100 font-medium transition duration-200 group";

    // Проверка роли админа
    useEffect(() => {
        const checkAdmin = async () => {
            if (!signer || !account) return;

            try {
                const contract = new Contract(
                    poolAddressJson.InvestmentPool,
                    poolAbi.abi,
                    signer,
                );

                const ADMIN_ROLE = await contract.ADMIN_ROLE();
                const hasRole = await contract.hasRole(ADMIN_ROLE, account);

                setIsAdmin(hasRole);
            } catch (err) {
                console.error("Admin check failed:", err);
            }
        };

        checkAdmin();
    }, [signer, account]);

    return (
        <>
            {/* Бургер */}
            {!open && (
                <button
                    onClick={toggleMenu}
                    className="fixed top-6 left-6 z-[60] p-3 bg-purpleDark/40 backdrop-blur-md rounded-lg border border-purpleLight/20 hover:bg-purpleDark/70 transition"
                >
                    <FiMenu className="text-2xl text-purpleLight" />
                </button>
            )}

            {/* Затемнение */}
            {open && (
                <div
                    onClick={toggleMenu}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                />
            )}

            {/* Панель */}
            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-purpleDark via-purpleDark/95 to-black shadow-2xl z-50 transform transition-transform duration-300
                ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Header панели */}
                <div className="flex items-center justify-between p-6 border-b border-purpleLight/20">
                    <h2 className="text-xl font-bold text-purpleLight">
                        Навигация
                    </h2>

                    <button
                        onClick={toggleMenu}
                        className="p-2 rounded-lg hover:bg-purpleDark/50 transition"
                    >
                        <FiX className="text-2xl text-purpleLight" />
                    </button>
                </div>

                {/* Ссылки */}
                <div className="flex flex-col space-y-4 p-6">
                    {account && (
                        <>
                            <Link
                                href="/token"
                                className={linkStyle}
                                onClick={toggleMenu}
                            >
                                <span className="flex items-center gap-3">
                                    <FiDatabase />
                                    Управление токенами
                                </span>
                                <FiArrowRight />
                            </Link>

                            <Link
                                href="/pool"
                                className={linkStyle}
                                onClick={toggleMenu}
                            >
                                <span className="flex items-center gap-3">
                                    <FiLayers />
                                    Пул
                                </span>
                                <FiArrowRight />
                            </Link>

                            <Link
                                href="/proposals"
                                className={linkStyle}
                                onClick={toggleMenu}
                            >
                                <span className="flex items-center gap-3">
                                    <FiFileText />
                                    Предложения
                                </span>
                                <FiArrowRight />
                            </Link>

                            <Link
                                href="/strategies"
                                className={linkStyle}
                                onClick={toggleMenu}
                            >
                                <span className="flex items-center gap-3">
                                    <FiTrendingUp />
                                    Стратегии
                                </span>
                                <FiArrowRight />
                            </Link>

                            {/* Только для админа */}
                            {isAdmin && (
                                <Link
                                    href="/admin"
                                    className={linkStyle}
                                    onClick={toggleMenu}
                                >
                                    <span className="flex items-center gap-3">
                                        <FiSettings />
                                        Админ панель
                                    </span>
                                    <FiArrowRight />
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <div className="absolute bottom-6 left-0 w-full px-6 text-sm text-purple-400">
                    Dao Invest
                </div>
            </aside>
        </>
    );
}
