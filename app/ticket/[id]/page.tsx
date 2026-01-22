'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, CheckCircle, Plus, Upload, Trash2, Shield } from 'lucide-react';
import { db, LocalTicket, LocalVehicle } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignaturePad } from '@/components/pwa/SignaturePad';
import { useSyncManager } from '@/lib/sync';

export default function TicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const ticketId = (Array.isArray(id) ? id[0] : id) || '';

    const ticket = useLiveQuery(() => db.tickets.get(ticketId));
    const vehicles = useLiveQuery(() => db.vehicles.where('localTicketId').equals(ticketId).toArray());

    // Master Data Lookups (Quick In-Memory for display)
    const [servicioName, setServicioName] = useState('');
    const [municipioName, setMunicipioName] = useState('');

    // Police State
    const [placa, setPlaca] = useState('');
    const [firma, setFirma] = useState<string | null>(null);

    const { syncTickets } = useSyncManager();

    useEffect(() => {
        if (ticket) {
            setPlaca(ticket.policiaPlaca || '');
            setFirma(ticket.policiaFirma || null);

            db.masterData.get('servicios').then(r => {
                const s = r?.data.find((x: any) => x.id === ticket.servicioId);
                if (s) setServicioName(s.nombre);
            });
            db.masterData.get('municipios').then(r => {
                const m = r?.data.find((x: any) => x.id === ticket.municipioId);
                if (m) setMunicipioName(m.nombre);
            });
        }
    }, [ticket]);

    const handleFinalize = async () => {
        if (!placa || !firma) {
            alert("Falta número de placa y firma");
            return;
        }

        if (ticket) {
            await db.tickets.update(ticket.id, {
                policiaPlaca: placa,
                policiaFirma: firma,
                // Mark as 'ready to sync' (in a real app, maybe changing a status field)
            });

            // Try sync immediately if online
            if (navigator.onLine) {
                syncTickets();
            }

            router.push('/');
        }
    };

    if (!ticket) return <div className="p-8 text-center">Cargando servicio...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b px-4 py-3 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="font-bold text-lg">Servicio {ticket.tempId?.slice(0, 4)}</h1>
                        <p className="text-xs text-slate-500">{municipioName} • {servicioName}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {ticket.fechaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-4 max-w-md mx-auto">

                {/* Vehicles List */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Vehículos Retirados</h2>

                    <div className="space-y-3">
                        {vehicles?.map(v => (
                            <Card key={v.id} className="overflow-hidden">
                                <CardContent className="p-0 flex">
                                    {/* Thumbnail */}
                                    <div className="w-24 bg-slate-200 object-cover relative">
                                        {v.fotos[0] ? (
                                            <img src={v.fotos[0]} className="w-full h-full object-cover absolute inset-0" alt="v" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                <Car className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-lg font-bold font-mono">{v.matricula}</div>
                                                <div className="text-sm text-slate-600">{v.marca} {v.modelo}</div>
                                            </div>
                                            {v.esMoto && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1 py-0.5 rounded">MOTO</span>}
                                        </div>
                                        <div className="mt-2 text-xs text-slate-400">
                                            {v.fotos.length} fotos
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            className="w-full h-14 border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-400"
                            variant="outline"
                            onClick={() => router.push(`/ticket/${ticketId}/vehicle/new`)}
                        >
                            <Plus className="mr-2 h-5 w-5" /> Añadir Vehículo
                        </Button>
                    </div>
                </section>

                {/* Police Section */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Datos Policiales
                    </h2>
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Nº Placa Agente</Label>
                                <Input
                                    placeholder="Placa..."
                                    value={placa}
                                    onChange={(e) => setPlaca(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Firma Conformidad</Label>
                                <div className="border bg-slate-50 p-1 rounded">
                                    {/* If signature exists, show img, else SignPad.
                                        For simplicity here allowing re-sign always.
                                    */}
                                    <SignaturePad onChange={setFirma} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Actions */}
                <div className="pt-6">
                    <Button size="lg" className="w-full font-bold bg-green-600 hover:bg-green-700" onClick={handleFinalize}>
                        <CheckCircle className="mr-2 h-5 w-5" /> Finalizar y Sincronizar
                    </Button>
                </div>

            </main>
        </div>
    );
}
