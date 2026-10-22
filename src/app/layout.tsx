import type { Metadata } from "next";
import "./globals.css";

// Fontes carregadas por <link> (não por next/font) para o build funcionar em redes restritas.
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap";

export const metadata: Metadata = {
  title: "Igreja Adventista Nova Esperança — A Chave da Virada",
  description:
    "Um livro gratuito, um curso bíblico no seu ritmo e alguém para orar por você. Sem pressão, sem cobrança. Só esperança.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Igreja Adventista Nova Esperança — A Chave da Virada",
    description: "Esperança para você, sem compromisso.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
