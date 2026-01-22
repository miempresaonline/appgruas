import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gestión de Grúas Municipal",
    description: "Plataforma de gestión de retiradas de vehículos",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#000000",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom on mobile inputs
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <main className="min-h-screen bg-slate-50 text-slate-900">
                    {children}
                </main>
            </body>
        </html>
    );
}
