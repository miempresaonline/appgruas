'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Checkbox } from "@/components/ui/checkbox"
import { CameraCapture } from '@/components/pwa/CameraCapture';
import { ArrowLeft, ScanText, Save, Loader2, Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert File to Base64
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
            alert("Primero toma una foto del vehículo (frontal)");
            return;
        }

        setOcrLoading(true);
        try {
            // Convert first image to base64
            const base64Image = await fileToBase64(files[0]);

            const response = await fetch('/api/analyze-plate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            if (data.plate && data.plate !== 'NOT_FOUND') {
                setMatricula(data.plate);
            } else {
                alert("No se detectó ninguna matrícula clara en la imagen.");
            }

        } catch (e) {
            console.error(e);
            alert("Error al analizar la imagen: " + String(e));
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

    const marcaOptions = marcas?.map((m: any) => ({ value: m.id, label: m.nombre })) || [];
    const modeloOptions = modelos?.map((m: any) => ({ value: m.id, label: m.nombre })) || [];

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
                            className="h-8 text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        >
                            {ocrLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                            IA Scan
                        </Button>
                    </div>
                    <Input
                        className="text-3xl font-mono uppercase tracking-widest text-center h-16 font-black"
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
                        <SearchableSelect
                            label="Marca"
                            options={marcaOptions}
                            value={marcaId}
                            onChange={(val) => {
                                setMarcaId(val);
                                setModeloId(''); // Reset model when make changes
                            }}
                            placeholder="Buscar marca..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Modelo</Label>
                        <SearchableSelect
                            label="Modelo"
                            options={modeloOptions}
                            value={modeloId}
                            onChange={setModeloId}
                            disabled={!marcaId}
                            placeholder="Buscar modelo..."
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 justify-center bg-slate-50">
                            <Checkbox id="moto" checked={esMoto} onCheckedChange={(c) => setEsMoto(!!c)} />
                            <label htmlFor="moto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Motocicleta
                            </label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-md flex-1 justify-center bg-slate-50">
                            <Checkbox id="peso" checked={esSobrepeso} onCheckedChange={(c) => setEsSobrepeso(!!c)} />
                            <label htmlFor="peso" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sobrepeso
                            </label>
                        </div>
                    </div>
                </section>

                <Button size="lg" className="w-full font-bold text-lg h-12 shadow-lg shadow-indigo-200" onClick={handleSave}>
                    Guardar Vehículo <Save className="ml-2 h-5 w-5" />
                </Button>

            </main>
        </div>
    );
}

