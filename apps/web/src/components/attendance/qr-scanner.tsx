'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Flashlight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useSubmitAttendance } from '@/hooks/use-attendance';
import toast from 'react-hot-toast';

export function QrScannerComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasFlash, setHasFlash] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    courseName?: string;
    timestamp?: string;
    message?: string;
  } | null>(null);

  const submitAttendanceMutation = useSubmitAttendance();

  const handleScanResult = async (decodedText: string) => {
    if (!decodedText || submitAttendanceMutation.isPending) return;

    // Pause scanner briefly on read
    try {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    } catch {}

    setIsScanning(false);

    try {
      // Get location if student permits
      let latitude: number | undefined;
      let longitude: number | undefined;

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 4000,
              maximumAge: 60000,
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch {}
      }

      const res = await submitAttendanceMutation.mutateAsync({
        qrToken: decodedText,
        latitude,
        longitude,
      });

      setLastScannedResult({
        success: true,
        courseName: res?.courseName || 'Lecture Session',
        timestamp: new Date().toLocaleTimeString(),
        message: 'Your attendance was successfully verified and recorded as PRESENT.',
      });
    } catch (err: any) {
      setLastScannedResult({
        success: false,
        message:
          err.response?.data?.message ||
          'Failed to record attendance. The QR code may have expired or is invalid.',
      });
    }
  };

  useEffect(() => {
    let active = true;

    async function initScanner() {
      if (!videoRef.current) return;
      try {
        const QrScannerModule = (await import('qr-scanner')).default;

        const hasCam = await QrScannerModule.hasCamera();
        if (!hasCam) {
          if (active) {
            setHasCamera(false);
            setCameraError('No camera found on this device. Please use manual entry.');
          }
          return;
        }

        const scanner = new QrScannerModule(
          videoRef.current,
          (result) => {
            handleScanResult(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 4,
          }
        );

        scannerRef.current = scanner;

        await scanner.start();
        if (active) {
          setIsScanning(true);
          const flashAvailable = await scanner.hasFlash();
          setHasFlash(flashAvailable);
        }
      } catch (err: any) {
        if (active) {
          setCameraError(
            err.message ||
              'Unable to access camera. Please allow camera permissions in your browser.'
          );
          setIsScanning(false);
        }
      }
    }

    initScanner();

    return () => {
      active = false;
      if (scannerRef.current) {
        try {
          scannerRef.current.destroy();
        } catch {}
        scannerRef.current = null;
      }
    };
  }, []);

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasFlash) return;
    try {
      await scannerRef.current.toggleFlash();
      const isCurrentlyOn = scannerRef.current.isFlashOn();
      setTorchOn(isCurrentlyOn);
    } catch {
      toast.error('Flash toggle failed');
    }
  };

  const restartScanner = async () => {
    setLastScannedResult(null);
    setCameraError(null);
    if (scannerRef.current) {
      try {
        await scannerRef.current.start();
        setIsScanning(true);
      } catch (err: any) {
        setCameraError(err.message || 'Could not start camera');
      }
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('Please enter the session code');
      return;
    }
    await handleScanResult(manualCode.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="overflow-hidden border-border/80 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-5">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-300" />
            <CardTitle className="text-white text-lg">
              Scan Attendance QR
            </CardTitle>
          </div>
          <CardDescription className="text-indigo-200 text-xs">
            Point your camera at the screen in your lecture hall
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Success / Error Feedback Card */}
          {lastScannedResult && (
            <div className="animate-in fade-in-50 zoom-in-95 duration-200">
              {lastScannedResult.success ? (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-emerald-900 dark:text-emerald-200 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Attendance Verified!</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        {lastScannedResult.timestamp}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {lastScannedResult.message}
                  </p>
                  <Button
                    size="sm"
                    onClick={restartScanner}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Scan Another Session
                  </Button>
                </div>
              ) : (
                <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-900 dark:text-rose-200 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Verification Failed</h4>
                      <p className="text-xs text-rose-700 dark:text-rose-400">
                        Please try again
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {lastScannedResult.message}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={restartScanner}
                    className="w-full border-rose-300 text-rose-700 hover:bg-rose-100 text-xs"
                  >
                    Retry Camera Scan
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Viewfinder Area */}
          {!lastScannedResult && (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {/* Viewfinder Target Graphic */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                  <div className="relative w-48 h-48 border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                    {/* Corner Reticles */}
                    <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-400 rounded-tl-md" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-400 rounded-tr-md" />
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-400 rounded-bl-md" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-400 rounded-br-md" />

                    {/* Animated laser scan line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_8px_#818cf8] animate-pulse-subtle absolute top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Camera Error / Permission Fallback */}
              {cameraError && (
                <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center">
                  <CameraOff className="h-10 w-10 text-rose-400 mb-2" />
                  <p className="font-semibold text-sm">Camera Unavailable</p>
                  <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
                    {cameraError}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={restartScanner}
                    className="text-xs text-slate-900 border-white bg-white hover:bg-slate-100"
                  >
                    Retry Permission
                  </Button>
                </div>
              )}

              {/* Flashlight Overlay Button */}
              {hasFlash && isScanning && (
                <div className="absolute top-3 right-3">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleTorch}
                    className={`h-9 w-9 rounded-full ${
                      torchOn ? 'bg-amber-400 text-slate-950' : 'bg-black/60 text-white'
                    }`}
                  >
                    <Flashlight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Fallback Manual Code Entry */}
          <div className="pt-2 border-t">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Having trouble scanning? Enter session code manually:
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                placeholder="e.g. CAV-83921"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="text-sm font-mono uppercase"
              />
              <Button
                type="submit"
                variant="cavpulse"
                isLoading={submitAttendanceMutation.isPending}
                className="shrink-0 text-xs gap-1"
              >
                <Send className="h-3.5 w-3.5" />
                Submit
              </Button>
            </form>
          </div>

          {/* Student attendance tips */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Attendance Rules:
            </p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>You must be physically present inside the designated lecture room.</li>
              <li>Scans after 15 minutes are automatically registered as Late.</li>
              <li>75% semester attendance is required to qualify for university exams.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

