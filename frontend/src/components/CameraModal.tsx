import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RefreshCw, Upload, AlertCircle, Sparkles } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(true);

  // Initialize or restart camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      if (!isOpen) return;

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      setErrorMsg(null);

      // Check if getUserMedia is available in browser
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        setErrorMsg("In-app live video feed is not supported on this browser. You can use the direct camera capture button below.");
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = mediaStream;
        setStream(mediaStream);
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch((err) => {
            console.warn("Video autoPlay prevented:", err);
          });
        }
      } catch (err: unknown) {
        console.warn("getUserMedia error:", err);
        setHasCameraPermission(false);
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setErrorMsg("Camera access was denied. Please allow camera permissions or use direct photo upload.");
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setErrorMsg("No physical camera device was detected on your system. Use file upload instead.");
        } else {
          setErrorMsg("Unable to access camera. Please use the mobile capture or photo upload fallback.");
        }
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Teardown tracks on modal close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setErrorMsg(null);
    onClose();
  };

  // Switch between rear ("environment") and front ("user") camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // High-resolution Frame Capture
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement("canvas");
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsCapturing(true);

    // If front-facing camera, flip horizontally for mirror realism
    if (facingMode === "user") {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (blob) {
          const file = new File([blob], `nutrilens_meal_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          // Stop camera stream tracks immediately
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
          }
          onCapture(file);
          onClose();
        }
      },
      "image/jpeg",
      0.95
    );
  };

  // Handle direct mobile camera fallback: <input type="file" accept="image/*" capture="environment" />
  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      onCapture(file);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl rounded-3xl border border-[#2A2A2A] bg-[#141414] shadow-subtle overflow-hidden flex flex-col"
          >
            {/* Header: Michelin Minimalist Top Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A] bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center text-[#C5A059]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#F5F5F0]">
                    In-App Live Camera
                  </h3>
                  <p className="text-[11px] text-[#888888] font-sans">
                    Align your dish within the gold reticle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#C5A059] flex items-center justify-center text-[#888888] hover:text-[#F5F5F0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Body */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
              {hasCameraPermission && !errorMsg ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${
                      facingMode === "user" ? "scale-x-[-1]" : ""
                    }`}
                  />

                  {/* Framing Focus Reticle (Soft Champagne Gold Corner Brackets) */}
                  <div className="absolute inset-8 sm:inset-12 pointer-events-none flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-7 h-7 border-t-2 border-l-2 border-[#C5A059] rounded-tl-sm opacity-90" />
                      <div className="w-7 h-7 border-t-2 border-r-2 border-[#C5A059] rounded-tr-sm opacity-90" />
                    </div>
                    {/* Center Subtle Crosshair */}
                    <div className="self-center flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full border border-[#C5A059]/60" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-7 h-7 border-b-2 border-l-2 border-[#C5A059] rounded-bl-sm opacity-90" />
                      <div className="w-7 h-7 border-b-2 border-r-2 border-[#C5A059] rounded-br-sm opacity-90" />
                    </div>
                  </div>

                  {/* Shutter flash overlay when photo is taken */}
                  {isCapturing && (
                    <div className="absolute inset-0 bg-white/80 animate-shutter pointer-events-none" />
                  )}
                </>
              ) : (
                /* Fallback State if camera permissions are unavailable */
                <div className="p-6 text-center max-w-sm">
                  <div className="w-12 h-12 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] mx-auto flex items-center justify-center text-[#C5A059] mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#F5F5F0] mb-1">
                    Live Feed Unavailable
                  </h4>
                  <p className="text-xs text-[#888888] leading-relaxed mb-4">
                    {errorMsg || "Camera stream could not be started."}
                  </p>

                  <div className="flex flex-col gap-2">
                    {/* Native Mobile Rear-Facing Camera Fallback */}
                    <button
                      type="button"
                      onClick={() => mobileInputRef.current?.click()}
                      className="btn-pill-gold px-5 py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Launch Native Device Camera</span>
                    </button>

                    {/* Gallery upload fallback */}
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="btn-pill-outline px-5 py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-[#888888]" />
                      <span>Choose from Photo Gallery</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Bar: Michelin Minimalist Shutter & Switchers */}
            <div className="px-6 py-4 bg-[#141414] border-t border-[#2A2A2A] flex items-center justify-between">
              {/* Left action: Gallery Upload */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                title="Select from gallery"
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#888888] hover:text-[#F5F5F0] hover:border-[#C5A059] transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Gallery</span>
              </button>

              {/* Center: Large Circular Shutter Button */}
              {hasCameraPermission && !errorMsg ? (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={isCapturing}
                    aria-label="Capture Meal Photo"
                    className="relative group p-1.5 rounded-full border-2 border-[#C5A059]/60 hover:border-[#C5A059] transition-colors focus:outline-none"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#C5A059] group-hover:bg-[#DFBE7A] transition-colors flex items-center justify-center shadow-gold-glow">
                      <div className="w-12 h-12 rounded-full border-2 border-[#141414] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-[#888888]">Use button below to snap</span>
              )}

              {/* Right action: Flip Camera */}
              <button
                type="button"
                onClick={handleToggleCamera}
                disabled={!hasCameraPermission || !!errorMsg}
                title="Flip Camera (Front/Rear)"
                className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-xs text-[#888888] hover:text-[#F5F5F0] hover:border-[#C5A059] transition-colors disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Flip</span>
              </button>
            </div>

            {/* Hidden Mobile Native Camera Input with capture="environment" */}
            <input
              type="file"
              ref={mobileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleMobileFileChange}
            />

            {/* Hidden Regular Gallery Input */}
            <input
              type="file"
              ref={galleryInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleMobileFileChange}
            />

            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
