import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GY MAISON COUTURE | ERP Central & Portails",
  description: "Système d'Information et ERP centralisé de la Maison de Haute Couture GY (ADMIN, ATELIER, MY GY)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gy-dark text-gy-text min-h-screen antialiased selection:bg-gy-gold selection:text-black">
        {children}
      </body>
    </html>
  );
}
