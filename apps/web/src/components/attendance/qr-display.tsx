'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Maximize2, Minimize2, Shield, Calendar, MapPin, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import apiClient from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QrDisplayProps {
  sessionId: string;
  courseCode?: string;
  courseName?: string;
  room?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

export function QrDisplay({
  sessionId,
  courseCode = 'CSC 3101',
  courseName = 'Intelligent Systems & Machine Learning',
  room = 'Main Hall B, Ggaba Campus',
  date = new Date().toISOString(),
  startTime = '09:00',
  endTime = '11:00',
  isActive = true,
}: QrDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [tokenString, setTokenString] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(55);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to generate a visual SVG QR placeholder if API is offline
  const generateClientFallbackQr = useCallback((token: string) => {
    // Generate a simple deterministic SVG QR-like matrix for testing
    const size = 25;
    const cells: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      cells[r] = [];
      for (let c = 0; c < size; c++) {
        // Standard corner finder patterns
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= size - 7;
        const isBottomLeft = r >= size - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isTopLeft ? r : isTopRight ? r : r - (size - 7);
          const lc = isTopLeft ? c : isTopRight ? c - (size - 7) : c;
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          cells[r][c] = isBorder || isInner;
        } else {
          // pseudo-random cell based on hash
          const val = (Math.sin(r * 13 + c * 17 + hash) + 1) / 2;
          cells[r][c] = val > 0.45;
        }
      }
    }

    // Build SVG
    const cellSize = 12;
    const totalDim = size * cellSize;
    let svgRects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (cells[r][c]) {
          svgRects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e1b4b" />`;
        }
      }
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDim} ${totalDim}" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#ffffff" />
        ${svgRects}
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, []);

  const fetchFreshQr = useCallback(async () => {
    if (!isActive) return;
    setIsRefreshing(true);
    try {
      const response = await apiClient.get(`/sessions/${sessionId}/qr`);
      const { dataUrl, token } = response.data?.data || response.data || {};
      if (dataUrl) {
        setQrDataUrl(dataUrl);
      } else if (token) {
        setTokenString(token);
        setQrDataUrl(generateClientFallbackQr(token));
      } else {
        const fallbackToken = `cavpulse_${sessionId}_${Date.now()}`;
        setTokenString(fallbackToken);
        setQrDataUrl(generateClientFallbackQr(fallbackToken));
      }
    } catch {
      // Graceful offline fallback
      const fallbackToken = `cavpulse_${sessionId}_${Date.now()}`;
      setTokenString(fallbackToken);
      setQrDataUrl(generateClientFallbackQr(fallbackToken));
    } finally {
      setIsRefreshing(false);
      setTimeLeft(55);
    }
  }, [sessionId, isActive, generateClientFallbackQr]);

  // Initial load
  useEffect(() => {
    fetchFreshQr();
  }, [fetchFreshQr]);

  // Countdown timer
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchFreshQr();
          return 55;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchFreshQr, isActive]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // SVG ring calculations
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 55) * circumference;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center transition-all ${
        isFullscreen
          ? 'bg-slate-950 text-white min-h-screen p-8'
          : 'w-full'
      }`}
    >
      <Card className="w-full border-border/80 shadow-md overflow-hidden bg-card">
        {/* Session Info Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 hover:bg-amber-400">
                  {courseCode}
                </Badge>
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE SESSION
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    SESSION CLOSED
                  </Badge>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold mt-1 text-white">
                {courseName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs gap-1.5"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" /> Normal
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" /> Projector Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/15 text-xs text-indigo-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-300 shrink-0" />
              <span className="truncate">{room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-300 shrink-0" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-300 shrink-0" />
              <span>
                {formatTime(startTime)} – {formatTime(endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code Presentation Area */}
        <CardContent className="p-8 flex flex-col items-center">
          <div className="relative group p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
            {/* The QR Image */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center overflow-hidden rounded-xl">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="CavPulse Dynamic Attendance QR Code"
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="h-8 w-8 animate-spin mb-2 text-indigo-600" />
                  <span className="text-xs">Generating dynamic token...</span>
                </div>
              )}

              {/* Center Cavendish University Logo Stamp on QR */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-14 w-14 rounded-xl bg-white shadow-md p-1 border-2 border-indigo-600 flex flex-col items-center justify-center">
                  <Shield className="h-6 w-6 text-indigo-600" />
                  <span className="text-[7px] font-black tracking-tighter text-indigo-950 uppercase">
                    CUU
                  </span>
                </div>
              </div>
            </div>

            {/* Inactive overlay */}
            {!isActive && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                <Shield className="h-10 w-10 text-rose-400 mb-2" />
                <p className="font-semibold text-lg">Session is Closed</p>
                <p className="text-xs text-slate-300 mt-1">
                  QR code verification is currently inactive for this lecture.
                </p>
              </div>
            )}
          </div>

          {/* Dynamic Refresh Indicator & Ring */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-3">
              {/* Circular countdown gauge */}
              <div className="relative h-12 w-12 flex items-center justify-center">
                <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-indigo-600 transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                  {timeLeft}s
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Auto-rotating dynamic security token
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Refreshes every 55s to prevent proxy scanning
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchFreshQr();
                toast.success('Generated new security token');
              }}
              isLoading={isRefreshing}
              disabled={!isActive}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Rotate Now
            </Button>
          </div>

          {/* Security & Instruction note */}
          <div className="mt-6 p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center max-w-md">
            <p className="text-xs text-indigo-900 dark:text-indigo-200">
              Students: Open <strong>CavPulse app</strong> on your phone and scan
              this QR code. Ensure your device is connected to campus Wi-Fi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

