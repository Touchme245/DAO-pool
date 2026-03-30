import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import SideMenu from "./SideMenu";

export default function Layout({ children }) {
    return (
        <div className="app-body min-h-screen flex flex-col">
            <SideMenu />

            <Header />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>

            <Footer />
        </div>
    );
}
