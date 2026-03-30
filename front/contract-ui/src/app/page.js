"use client";

import React from "react";
import useHome from "./HomeLogic";
import HomeView from "./HomeView";

export default function HomePage() {
    const { account, connectWallet } = useHome();
    return <HomeView account={account} connectWallet={connectWallet} />;
}
