'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIphone = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIphone);

        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            console.log("PWA Install Prompt captured");
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Always show for iOS if not in standalone mode
        if (isIphone && !(window.navigator as any).standalone) {
            setIsVisible(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (isIOS) {
            alert("Para instalar en iOS:\n1. Pulsa el botón 'Compartir' (cuadrado con flecha)\n2. Busca y pulsa 'Añadir a Inicio'");
            return;
        }

        if (!deferredPrompt) {
            console.error("No deferred prompt found");
            return;
        }

        try {
            // Show the install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);

            // We've used the prompt, and can't use it again, discard it
            setDeferredPrompt(null);
            setIsVisible(false);
        } catch (err) {
            console.error("Error showing install prompt:", err);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
            <Card className="shadow-xl border-slate-200">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base font-semibold">Instalar Aplicación</CardTitle>
                        <p className="text-xs text-slate-500">
                            Instala la app para acceso rápido y offline.
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 text-slate-400" onClick={() => setIsVisible(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <Button onClick={handleInstallClick} className="w-full gap-2">
                        <Download className="h-4 w-4" /> Instalar ahora
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
