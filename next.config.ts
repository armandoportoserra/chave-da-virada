import type { NextConfig } from "next";

// Vitrine (site aprovado, Framer). O domínio raiz abre a vitrine; o app vive em app.igrejaadventista.ia.br
const SITE_VITRINE = process.env.SITE_VITRINE_URL ?? "https://igrejanovaesperanca.framer.website";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // igrejaadventista.ia.br e www → vitrine (só a página inicial; o restante do app continua funcionando no domínio raiz)
      { source: "/", has: [{ type: "host", value: "igrejaadventista.ia.br" }], destination: SITE_VITRINE, permanent: false },
      { source: "/", has: [{ type: "host", value: "www.igrejaadventista.ia.br" }], destination: SITE_VITRINE, permanent: false },
    ];
  },
};

export default nextConfig;
