import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { supportedCryptos } from '../lib/cryptoList';

interface CryptoSelectorProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export function CryptoSelector({ selectedSymbol, onSelect }: CryptoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCrypto = supportedCryptos.find(crypto => crypto.symbol === selectedSymbol);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1E2028] text-white px-4 py-3 rounded-lg flex items-center justify-between active-state touch-target"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-${selectedCrypto?.symbol.toLowerCase()}`}>
            {selectedCrypto?.symbol}
          </span>
          <span className="text-gray-400">{selectedCrypto?.name}</span>
        </div>
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-x-0 top-0 bottom-0 z-[100] bg-[#13141b] safe-top safe-bottom overflow-hidden">
          <div className="h-full flex flex-col max-w-[420px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-bold">Select Crypto</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-full active-state touch-target"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Crypto List */}
            <div className="flex-1 overflow-auto">
              <div className="p-4 space-y-2">
                {supportedCryptos.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => {
                      onSelect(crypto.symbol);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-2 rounded-lg active-state touch-target ${
                      selectedSymbol === crypto.symbol ? 'bg-[#2d2d3d]' : 'hover:bg-[#1E2028]'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <span className={`text-${crypto.symbol.toLowerCase()}`}>
                      {crypto.symbol}
                    </span>
                    <span className="text-gray-400">{crypto.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}