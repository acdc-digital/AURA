import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/provider/theme-provider";
import { AuthSync } from "./_components/auth/AuthSync";
import { AgentInitializer } from "./_components/agents/AgentInitializer";
import { ExtensionInitializer } from "./_components/extensions/ExtensionInitializer";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider dynamic>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <AuthSync />
              <AgentInitializer />
              <ExtensionInitializer />
              <div className="flex-1">
                {children}
              </div>
            </ThemeProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
