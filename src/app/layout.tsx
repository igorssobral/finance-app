import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import { ServiceWorkerRegistration } from "@/components/providers/service-worker-registration";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Finance App — Gerenciamento Financeiro Pessoal",
    template: "%s · Finance App",
  },
  description:
    "Controle suas receitas, despesas, cartões, metas e investimentos em um só lugar.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
