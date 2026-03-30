import { WalletProvider } from "./context/WalletContext";
import "./globals.css";

export const metadata = {
    title: "DAO Dashboard",
    description: "DAO Invest pool",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ru">
            <body className="bg-gradient-to-b from-purple-900 via-black to-black text-white font-sans min-h-screen flex flex-col">
                <WalletProvider>
                    <div className="flex-1 w-full max-w-7xl mx-auto px-6">
                        {children}
                    </div>
                </WalletProvider>
            </body>
        </html>
    );
}
