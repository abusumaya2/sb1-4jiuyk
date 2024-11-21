import React from 'react';

interface CryptoLogoProps {
  symbol: string;
  size?: number;
}

export function CryptoLogo({ symbol, size = 24 }: CryptoLogoProps) {
  const logos: Record<string, JSX.Element> = {
    BTC: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.176 0 0 7.176 0 16s7.176 16 16 16 16-7.176 16-16S24.824 0 16 0zm7.36 16.96c-.08 2.72-2.24 4.08-4.8 4.32v2.72h-1.6v-2.64h-1.28v2.64h-1.6v-2.72H11.2v-1.76h1.12c.8 0 .96-.32.96-.8V11.2c0-.64-.32-.8-.96-.8h-1.12V8.64h3.04V6h1.6v2.64h1.28V6h1.6v2.72c2.24.16 4.16 1.12 4.32 3.52.16 1.92-.96 2.88-2.24 3.2 1.6.24 2.4 1.28 2.32 3.52zm-2.32-6.72c0-1.76-2.64-1.92-3.52-1.92v3.84c.88 0 3.52-.16 3.52-1.92zm.48 6.56c0-1.92-2.96-2.08-4-2.08v4.16c1.04 0 4-.16 4-2.08z" fill="currentColor"/>
      </svg>
    ),
    ETH: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.176 0 0 7.176 0 16s7.176 16 16 16 16-7.176 16-16S24.824 0 16 0zm-.24 20.8L10.4 16l5.36 7.52L21.6 16l-5.84 4.8zm.24-12.8L10.4 15.2l5.6 3.28 5.6-3.28L16 8z" fill="currentColor"/>
      </svg>
    ),
    USDT: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.176 0 0 7.176 0 16s7.176 16 16 16 16-7.176 16-16S24.824 0 16 0zm7.2 17.44v2.4h-4v1.6c2.4.24 4.24.96 4.24 1.84 0 .88-1.84 1.6-4.24 1.84v.88h-2.4v-.88c-2.4-.24-4.24-.96-4.24-1.84h2.4c0 .24.8.56 1.84.72v-1.6c-2.4-.24-4.24-.96-4.24-1.84 0-.88 1.84-1.6 4.24-1.84v-2.4h2.4v2.4c2.4.24 4.24.96 4.24 1.84 0 .88-1.84 1.6-4.24 1.84v1.6c1.04-.16 1.84-.48 1.84-.72h2.4zm-4-6.24V8.8h2.4v2.4h4v2.4h-13.2v-2.4h4V8.8h2.4v2.4h.4z" fill="currentColor"/>
      </svg>
    ),
    MATIC: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.176 0 0 7.176 0 16s7.176 16 16 16 16-7.176 16-16S24.824 0 16 0zm-4.8 19.2l4.8 2.4 4.8-2.4V24l-4.8 2.4L11.2 24v-4.8zm0-8.8l4.8 2.4 4.8-2.4v4.8l-4.8 2.4-4.8-2.4v-4.8zm4.8-2.4L11.2 5.6 16 3.2l4.8 2.4-4.8 2.4z" fill="currentColor"/>
      </svg>
    ),
    QNT: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.176 0 0 7.176 0 16s7.176 16 16 16 16-7.176 16-16S24.824 0 16 0zm8 20.8h-4.8V24h-6.4v-3.2H8v-6.4h3.2V8h6.4v6.4H24v6.4z" fill="currentColor"/>
      </svg>
    )
  };

  const defaultLogo = (
    <div className="w-full h-full flex items-center justify-center font-bold">
      {symbol.charAt(0)}
    </div>
  );

  return (
    <div className={`w-${size} h-${size} text-white`}>
      {logos[symbol] || defaultLogo}
    </div>
  );
}