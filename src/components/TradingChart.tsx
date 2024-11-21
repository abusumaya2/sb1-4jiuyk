import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface TradingChartProps {
  symbol: string;
  currentPrice: number;
  loading: boolean;
}

export function TradingChart({ symbol, currentPrice, loading }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'>>();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart with minimalist design
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1E2028' },
        textColor: '#848E9C',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: '#2B2F3A' },
        horzLines: { color: '#2B2F3A' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderColor: '#2B2F3A',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B2F3A',
      },
      crosshair: {
        vertLine: {
          color: '#848E9C',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1E2028',
        },
        horzLine: {
          color: '#848E9C',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1E2028',
        },
      },
    });

    chartRef.current = chart;

    // Add candlestick series with clean styling
    candlestickSeriesRef.current = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Fetch and update data
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1m&limit=100`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const candleData: CandlestickData[] = data.map((k: any) => ({
          time: k[0] / 1000,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4])
        }));

        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(candleData);
          chart.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@kline_1m`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === 'kline' && candlestickSeriesRef.current) {
          const { k: kline } = data;
          candlestickSeriesRef.current.update({
            time: kline.t / 1000,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c)
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    fetchData();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      ws.close();
    };
  }, [symbol]);

  return (
    <div className="relative">
      <div ref={chartContainerRef} className="w-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1E2028]/80">
          <div className="text-gray-400 bg-[#2d2d3d] px-4 py-2 rounded-lg">
            Loading chart data...
          </div>
        </div>
      )}
    </div>
  );
}