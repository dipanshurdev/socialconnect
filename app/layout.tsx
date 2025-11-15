import type { Metadata } from "next";
// import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// const _geist = Geist({ subsets: ["latin"] });
// const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SocialConnect - Connect with Friends",
  description:
    "A modern social media platform to connect and share with your friends",
  generator: "create next app",
  icons: {
    icon: [
      {
        url: "/connect.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/connect.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
