'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, RefreshCw, Truck } from 'lucide-react';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function OperatorDashboard() {
    const pendingTickets = useLiveQuery(() => db.tickets.where('synced').equals(0).count());
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        return () => {
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, []);

    return (
        <div className="p-4 max-w-md mx-auto space-y-6">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Truck className="h-6 w-6" />
                    Gruas Municipal
                </h1>
                <div className={`text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                </div>
            </header>

            <Card className="bg-slate-900 text-white border-none">
                <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
                    <Link href="/ticket/new" className="w-full">
                        <Button size="lg" className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-500">
                            <PlusCircle className="mr-2 h-6 w-6" />
                            Nuevo Albarán
                        </Button>
                    </Link>
                    <p className="text-slate-400 text-sm">
                        Crear servicio de retirada en vía pública
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTickets ?? 0}</div>
                        <p className="text-xs text-slate-400">Por sincronizar</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Estado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <RefreshCw className={`h-5 w-5 ${pendingTickets ? 'animate-spin text-blue-500' : 'text-slate-300'}`} />
                            <span className="text-sm font-medium">
                                {pendingTickets ? 'Sincronizando...' : 'Al día'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <section>
                <h2 className="font-semibold mb-3">Recientes</h2>
                {/* List of recent items can go here */}
                <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed rounded-lg">
                    No hay servicios recientes hoy
                </div>
            </section>
        </div>
    );
}
