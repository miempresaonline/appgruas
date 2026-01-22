'use client';

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onChange: (base64: string | null) => void;
}

export function SignaturePad({ onChange }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
        onChange(null);
    };

    const handleEnd = () => {
        if (sigCanvas.current?.isEmpty()) {
            setIsEmpty(true);
            onChange(null);
        } else {
            setIsEmpty(false);
            onChange(sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') || null);
        }
    };

    return (
        <div className="border rounded-md bg-white overflow-hidden relative">
            <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{
                    className: 'w-full h-40 bg-white'
                }}
                onEnd={handleEnd}
            />
            <div className="absolute top-2 right-2">
                <Button size="icon" variant="secondary" onClick={clear} type="button">
                    <Eraser className="h-4 w-4" />
                </Button>
            </div>
            {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300">
                    <span className="text-sm">Firmar aquí</span>
                </div>
            )}
        </div>
    );
}
