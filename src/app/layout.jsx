import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SkillHunt IntelliTrack",
  description: "Developer Intelligence & Recruitment Monitoring Platform",
  keywords: ["recruitment", "developer", "intelligence", "hiring", "analytics"],
};

export default async function RootLayout({ children }) {
  // Try to grab session on the server to pass to the client Provider
  // This prevents blank screens caused by flashing auth states
  let session = null;
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("Failed to get server session in layout:", err);
  }

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
