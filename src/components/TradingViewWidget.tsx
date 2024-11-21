import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  theme?: 'dark' | 'light';
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

export function TradingViewWidget({ symbol, theme = 'dark' }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !window.TradingView) return;

    const container = containerRef.current;
    const containerId = `tradingview_${symbol.toLowerCase()}_${Date.now()}`;
    container.id = containerId;

    // Clean up previous widget if it exists
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (error) {
        // Ignore cleanup errors
      }
      widgetRef.current = null;
    }

    // Clear container
    container.innerHTML = '';

    try {
      // Create new widget with adjusted height and RSI settings
      widgetRef.current = new window.TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}USDT`,
        interval: "1",
        timezone: "Etc/UTC",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        hide_top_toolbar: true,
        hide_legend: true,
        save_image: false,
        container_id: containerId,
        backgroundColor: "rgba(26, 27, 35, 1)",
        gridColor: "rgba(45, 45, 61, 0.5)",
        allow_symbol_change: false,
        height: 300,
        details: true,
        hotlist: true,
        calendar: false,
        studies: [
          {
            id: "RSI@tv-basicstudies",
            inputs: {
              length: 14,
              // Disable trend lines by setting their visibility to false
              "plot.1.visibility": false,
              "plot.2.visibility": false,
              "plot.3.visibility": false
            }
          }
        ],
        disabled_features: [
          "use_localstorage_for_settings",
          "header_symbol_search",
          "symbol_search_hot_key",
          "header_compare",
          "header_undo_redo",
          "header_screenshot",
          "header_saveload",
          "left_toolbar",
          "volume_force_overlay"
        ],
        enabled_features: ["hide_left_toolbar_by_default"],
        overrides: {
          // Customize RSI appearance
          "RSIStudy.linewidth": 2,
          "RSIStudy.plot.color": "#2962FF",
          "RSIStudy.overbought.color": "rgba(76, 175, 80, 0.3)",
          "RSIStudy.oversold.color": "rgba(255, 82, 82, 0.3)"
        }
      });
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
        widgetRef.current = null;
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
    />
  );
}