import type { Metadata } from "next";
import { Karla, Kalam, Lora } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Menú semanal",
  description: "Menú semanal y lista de compras para Fede y su novia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${lora.variable} ${karla.variable} ${kalam.variable} h-full antialiased`}
    >
      <body className="min-h-full flex justify-center bg-outer-bg">
        <div className="flex min-h-screen w-full max-w-[480px] flex-col bg-background shadow-[0_0_40px_rgba(0,0,0,0.08)]">
          <div className="flex flex-1 flex-col">{children}</div>
          <Nav />
        </div>
      </body>
    </html>
  );
}
