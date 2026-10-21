export function linkWhatsapp(texto = "Olá! Recebi o folder A Chave da Virada e quero saber mais.") {
  const n = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? "";
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}

export default function BotaoWhatsapp({ fixo = false, texto, children }: { fixo?: boolean; texto?: string; children?: React.ReactNode }) {
  const cls = fixo
    ? "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white shadow-lg hover:brightness-110"
    : "btn-gold";
  return (
    <a href={linkWhatsapp(texto)} target="_blank" rel="noopener noreferrer" className={cls} aria-label="Falar pelo WhatsApp">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
      </svg>
      {children ?? "Falar no WhatsApp"}
    </a>
  );
}
