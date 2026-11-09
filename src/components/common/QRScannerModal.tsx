import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, Upload, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export interface ScannedStudentData {
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  classLevel: string;
  phone?: string;
}

export interface ScannedBookData {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publisher?: string;
  publicationYear?: number;
  description?: string;
  totalCopies?: number;
}

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'student' | 'book';
  onScanSuccess: (payload: { raw: string; student?: ScannedStudentData; book?: ScannedBookData }) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  mode,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès à la caméra n'est pas supporté par ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestScanFrame();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        err?.message ||
          "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur ou utilisez l'import d'image ci-dessous."
      );
      setCameraActive(false);
    }
  };

  // Frame scanner loop
  const requestScanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        handleRawDecodedText(code.data);
        return; // stop scanning after successful decode
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(requestScanFrame);
  };

  const handleRawDecodedText = (rawText: string) => {
    setScannedResult(rawText);
    stopCamera();

    try {
      // Attempt JSON parse
      const parsed = JSON.parse(rawText);
      if (mode === 'student') {
        const studentData: ScannedStudentData = {
          studentNumber: parsed.studentNumber || parsed.id || 'E20249999',
          firstName: parsed.firstName || parsed.prenom || 'Nouveau',
          lastName: parsed.lastName || parsed.nom || 'Étudiant',
          email: parsed.email || (parsed.studentNumber ? `${parsed.studentNumber.toLowerCase()}@usmba.ac.ma` : 'etudiant@usmba.ac.ma'),
          department: parsed.department || parsed.filiere || 'Faculté des Sciences Dhar El Mehraz',
          classLevel: parsed.classLevel || parsed.classe || 'Licence',
          phone: parsed.phone || parsed.tel || '',
        };
        onScanSuccess({ raw: rawText, student: studentData });
      } else {
        const bookData: ScannedBookData = {
          title: parsed.title || parsed.titre || 'Titre scanné',
          author: parsed.author || parsed.auteur || 'Auteur',
          isbn: parsed.isbn || rawText,
          genre: parsed.genre || 'Général',
          publisher: parsed.publisher || parsed.editeur || '',
          publicationYear: parsed.publicationYear || parsed.annee || new Date().getFullYear(),
          description: parsed.description || 'Livre scanné via QR Code',
          totalCopies: parsed.totalCopies || parsed.exemplaires || 1,
        };
        onScanSuccess({ raw: rawText, book: bookData });
      }
    } catch {
      // Non-JSON raw code (e.g., bare ISBN or student ID string)
      if (mode === 'student') {
        const studentData: ScannedStudentData = {
          studentNumber: rawText.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'E20249999',
          firstName: 'Étudiant',
          lastName: 'Scanné',
          email: `${rawText.toLowerCase().replace(/[^a-z0-9]/g, '')}@usmba.ac.ma`,
          department: 'Faculté des Sciences',
          classLevel: 'Master 1',
        };
        onScanSuccess({ raw: rawText, student: studentData });
      } else {
        const bookData: ScannedBookData = {
          title: `Ouvrage ISBN ${rawText}`,
          author: 'Auteur à préciser',
          isbn: rawText,
          genre: 'Informatique',
          publicationYear: 2024,
          totalCopies: 1,
        };
        onScanSuccess({ raw: rawText, book: bookData });
      }
    }
  };

  // Image file drop or upload decode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleRawDecodedText(code.data);
          } else {
            setCameraError("Aucun QR code valide détecté dans l'image sélectionnée.");
          }
        }
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick simulation presets for testing
  const handleSimulateScan = (presetType: 'student' | 'book') => {
    if (presetType === 'student') {
      const sampleStudent: ScannedStudentData = {
        studentNumber: 'E20249012',
        firstName: 'Karim',
        lastName: 'El Mansouri',
        email: 'karim.elmansouri@usmba.ac.ma',
        department: 'Faculté des Sciences Dhar El Mehraz',
        classLevel: 'Master 2 Systèmes Intelligents',
        phone: '+212 6 68 55 44 33',
      };
      handleRawDecodedText(JSON.stringify(sampleStudent));
    } else {
      const sampleBook: ScannedBookData = {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        isbn: '978-0201633610',
        genre: 'Informatique',
        publisher: 'Addison-Wesley',
        publicationYear: 1994,
        description: 'Les 23 patrons de conception classiques pour l\'architecture logicielle orientée objet.',
        totalCopies: 2,
      };
      handleRawDecodedText(JSON.stringify(sampleBook));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {mode === 'student' ? 'Scanner une carte étudiant' : 'Scanner le QR code du livre'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="p-6">
          <div className="relative aspect-4/3 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle / Scanner Overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-sky-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-sky-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-sky-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-sky-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-sky-400 rounded-br-lg" />
                  
                  {/* Laser scan line animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
            )}

            {/* Fallback state if camera is off or errored */}
            {!cameraActive && (
              <div className="p-6 text-center text-slate-300 max-w-sm">
                <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-200">
                  {cameraError ? 'Accès caméra indisponible' : 'Initialisation de la caméra...'}
                </p>
                {cameraError && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {cameraError}
                  </p>
                )}
                <button
                  onClick={startCamera}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Réessayer
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
            Placez le QR code au centre du cadre pour une détection automatique.
          </p>

          {/* Action alternatives: Image upload + One-click test simulation */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {isProcessing ? 'Lecture en cours...' : 'Importer une image de QR Code'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {cameraActive && (
                <button
                  onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Changer de caméra
                </button>
              )}
            </div>

            {/* Test Simulation Button */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {mode === 'student' ? 'Tester avec une carte étudiante modèle' : 'Tester avec un livre modèle'}
                </span>
              </div>
              <button
                onClick={() => handleSimulateScan(mode)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs transition-colors shrink-0"
              >
                Simuler le scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
