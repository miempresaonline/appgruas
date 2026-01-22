'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, MapPin, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { seedMasterData } from '@/lib/seed-client';
import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';

export default function NewTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    // Form State
    const [municipioId, setMunicipioId] = useState('');
    const [servicioId, setServicioId] = useState('');
    const [infraccionId, setInfraccionId] = useState('');
    const [calle, setCalle] = useState('');
    const [ciudad, setCiudad] = useState(''); // Should auto-fill from Municipio but editable

    // Data from Dexie
    const municipios = useLiveQuery(() => db.masterData.get('municipios').then(r => r?.data || []));
    const servicios = useLiveQuery(() => db.masterData.get('servicios').then(r => r?.data || []));
    const infracciones = useLiveQuery(() => db.masterData.get('infracciones').then(r => r?.data || []));

    useEffect(() => {
        // Initialize Data
        seedMasterData().then(() => setLoading(false));

        // Geolocate
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();

                    if (data.address) {
                        const road = data.address.road || '';
                        const number = data.address.house_number || '';
                        const fullStreet = `${road} ${number}`.trim();
                        // Nominatim returns different fields for city depending on size
                        const cityName = data.address.city || data.address.town || data.address.village || data.address.municipality || '';

                        if (fullStreet) setCalle(fullStreet);
                        if (cityName) setCiudad(cityName);
                    }
                } catch (error) {
                    console.error("Error reverse geocoding:", error);
                }
            }, (err) => {
                console.warn("Geolocation error:", err);
            });
        }

        // Set Default Time (Start)
    }, []);

    const handleSaveDraft = async () => {
        if (!municipioId || !servicioId) {
            alert("Selecciona Municipio y Servicio");
            return;
        }

        const ticketId = uuidv4();
        await db.tickets.add({
            id: ticketId,
            municipioId,
            servicioId,
            infraccionId,
            calle,
            ciudad,
            fechaInicio: new Date(),
            synced: false,
            createdAt: new Date()
        });

        router.push(`/ticket/${ticketId}`);
    };

    if (loading) return <div className="p-8 text-center">Cargando datos maestros...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="font-semibold text-lg">Nuevo Servicio</h1>
            </header>

            <main className="p-4 space-y-6 max-w-md mx-auto">

                {/* SECTION 1: CONTEXT */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold uppercase tracking-wide text-slate-500">Datos Generales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="space-y-2">
                            <Label>Ayuntamiento</Label>
                            <Select onValueChange={setMunicipioId} value={municipioId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {municipios?.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Servicio</Label>
                            <Select onValueChange={setServicioId} value={servicioId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {servicios?.map((s: any) => (
                                        <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Infracción (Opcional)</Label>
                            <Select onValueChange={setInfraccionId} value={infraccionId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Buscar infracción..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {infracciones?.map((i: any) => (
                                        <SelectItem key={i.id} value={i.id}>{i.codigo} - {i.descripcion}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </CardContent>
                </Card>

                {/* SECTION 2: LOCATION & TIME */}
                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-bold uppercase tracking-wide text-slate-500">Ubicación y Hora</CardTitle>
                        <div className="flex gap-2 text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Calle / Ubicación</Label>
                            <Input
                                placeholder="Ej: Calle Mayor, 12"
                                value={calle}
                                onChange={(e) => setCalle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ciudad</Label>
                            <Input
                                placeholder="Ciudad"
                                value={ciudad}
                                onChange={(e) => setCiudad(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Button size="lg" className="w-full font-bold text-lg" onClick={handleSaveDraft}>
                    Continuar <Save className="ml-2 h-5 w-5" />
                </Button>

            </main>
        </div>
    );
}
