import type { Metadata } from "next";
import { ConvexClientProvider } from "./components/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Presence Reunion - Convex App",
  description: "Application de gestion de présence avec Convex",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
