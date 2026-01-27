import { useState, useEffect } from 'react';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true); // Solo se muestra si la app es instalable
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div 
      onClick={handleInstall}
      className="w-full bg-red-600 text-white p-1 text-center cursor-pointer animate-pulse sticky top-0 z-50 shadow-lg"
      style={{ cursor: 'pointer' }}
    >
      <p className="font-bold text-sm tracking-widest uppercase italic">
        🏁 ¡Instalá la App de Sprint Oil aquí! 🏁
      </p>
    </div>
  );
};

export default InstallBanner;