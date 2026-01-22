'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CameraCapture } from '@/components/pwa/CameraCapture';
import { ArrowLeft, ScanText, Save, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { createWorker } from 'tesseract.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert File to Base64 for storage (Dexie handles Blobs well but Base64 is safer for simple JSON stores)
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default function NewVehiclePage() {
    const { id } = useParams();
    // Ensure ticketId is a string. useParams can return string | string[] | undefined.
    // In this route [id] should be present, but we safeguard against undefined.
    const ticketId = (Array.isArray(id) ? id[0] : id) || '';
    const router = useRouter();

    const [matricula, setMatricula] = useState('');
    const [marcaId, setMarcaId] = useState('');
    const [modeloId, setModeloId] = useState('');
    const [esMoto, setEsMoto] = useState(false);
    const [esSobrepeso, setEsSobrepeso] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [ocrLoading, setOcrLoading] = useState(false);

    // Data
    const marcas = useLiveQuery(() => db.masterData.get('marcas').then(r => r?.data || []));
    const modelos = useLiveQuery(
        () => db.masterData.get('modelos').then(r => r?.data.filter((m: any) => m.marcaId === marcaId) || []),
        [marcaId]
    );

    const handleOCR = async () => {
        if (files.length === 0) {
            alert("Primero toma na foto del vehículo (frontal)");
            return;
        }
        setOcrLoading(true);
        try {
            const worker = await createWorker('spa');
            const ret = await worker.recognize(files[0]);
            // Simple regex to find license plate like pattern **** *** or E **** ***
            const text = ret.data.text.replace(/[^A-Z0-9]/g, '');
            // Heuristic: Take last 7 chars if long enough
            if (text.length >= 7) {
                setMatricula(text.slice(-7));
            } else {
                setMatricula(text);
            }
            await worker.terminate();
        } catch (e) {
            console.error(e);
            alert("Error al leer matrícula");
        } finally {
            setOcrLoading(false);
        }
    };

    const handleSave = async () => {
        if (!matricula || !marcaId || !modeloId) {
            alert("Completa matrícula, marca y modelo");
            return;
        }

        // 1. Process Images
        const photoPromises = files.map(f => fileToBase64(f));
        const photoBase64s = await Promise.all(photoPromises);

        // 2. Lookup names
        const marcaName = marcas?.find((m: any) => m.id === marcaId)?.nombre;
        const modeloName = modelos?.find((m: any) => m.id === modeloId)?.nombre;

        // 3. Save
        await db.vehicles.add({
            id: uuidv4(),
            localTicketId: ticketId,
            matricula,
            marca: marcaName || '',
            modelo: modeloName || '',
            esMoto,
            esSobrepeso,
            fotos: photoBase64s
        });

        router.back();
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="font-semibold text-lg">Añadir Vehículo</h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto">

                {/* PHOTOS */}
                <section className="bg-white p-4 rounded-lg border space-y-2">
                    <Label className="font-bold text-slate-500 uppercase text-xs">Fotografías</Label>
                    <CameraCapture onImagesCaptured={setFiles} />
                </section>

                {/* LICENSE PLATE */}
                <section className="bg-white p-4 rounded-lg border space-y-4">
                    <div className="flex justify-between items-end">
                        <Label className="font-bold text-slate-500 uppercase text-xs">Matrícula</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOCR}
                            disabled={ocrLoading || files.length === 0}
                            className="h-8 text-xs"
                        >
                            {ocrLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <ScanText className="mr-2 h-3 w-3" />}
                            Leer con Cámara
                        </Button>
                    </div>
                    <Input
                        className="text-2xl font-mono uppercase tracking-widest text-center h-14 font-bold"
                        placeholder="0000XXX"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                    />
                </section>

                {/* VEHICLE INFO */}
                <section className="bg-white p-4 rounded-lg border space-y-4">
                    <Label className="font-bold text-slate-500 uppercase text-xs">Datos Vehículo</Label>

                    <div className="space-y-2">
                        <Label>Marca</Label>
                        <Select onValueChange={setMarcaId} value={marcaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {marcas?.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Select onValueChange={setModeloId} value={modeloId} disabled={!marcaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                {modelos?.map((m: any) => (
                                    <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 justify-center">
                            <Checkbox id="moto" checked={esMoto} onCheckedChange={(c) => setEsMoto(!!c)} />
                            <label htmlFor="moto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Motocicleta
                            </label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 justify-center">
                            <Checkbox id="peso" checked={esSobrepeso} onCheckedChange={(c) => setEsSobrepeso(!!c)} />
                            <label htmlFor="peso" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sobrepeso
                            </label>
                        </div>
                    </div>
                </section>

                <Button size="lg" className="w-full font-bold text-lg" onClick={handleSave}>
                    Guardar Vehículo <Save className="ml-2 h-5 w-5" />
                </Button>

            </main>
        </div>
    );
}
