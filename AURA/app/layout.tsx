import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "AURA - AI Development Environment",
  description: "Your AI-powered development workspace with real-time collaboration",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="dark">
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <div className="flex-1">
              {children}
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
