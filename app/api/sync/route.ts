import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LocalTicket, LocalVehicle } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const tickets = body as (LocalTicket & { vehicles: LocalVehicle[] })[];

        if (!Array.isArray(tickets)) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const results = [];

        for (const ticket of tickets) {
            // Check if already exists by tempId
            const existing = await prisma.albaran.findFirst({
                where: { tempId: ticket.id }
            });

            if (existing) {
                results.push({ id: ticket.id, status: 'already_synced', serverId: existing.id });
                continue;
            }

            // Create new Albaran and Vehicles
            try {
                const newAlbaran = await prisma.albaran.create({
                    data: {
                        tempId: ticket.id,
                        municipioId: ticket.municipioId,
                        servicioId: ticket.servicioId,
                        infraccionId: ticket.infraccionId,
                        calle: ticket.calle,
                        ciudad: ticket.ciudad,
                        fechaInicio: new Date(ticket.fechaInicio),
                        fechaFin: ticket.fechaFin ? new Date(ticket.fechaFin) : null,
                        policiaPlaca: ticket.policiaPlaca,
                        policiaFirma: ticket.policiaFirma,
                        estado: 'SINCRONIZADO',
                        vehiculos: {
                            create: ticket.vehicles.map((v: LocalVehicle) => ({
                                matricula: v.matricula,
                                marca: v.marca,
                                modelo: v.modelo,
                                esMoto: v.esMoto,
                                esSobrepeso: v.esSobrepeso,
                                fotos: {
                                    create: v.fotos.map((url: string) => ({
                                        url: url, // In real app, upload blob/base64 to storage and get URL
                                        tipo: 'GENERAL' // Default
                                    }))
                                }
                            }))
                        }
                    }
                });
                results.push({ id: ticket.id, status: 'synced', serverId: newAlbaran.id });
            } catch (err) {
                console.error("Error creating ticket:", err);
                results.push({ id: ticket.id, status: 'error', error: String(err) });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (e) {
        console.error("Sync API Error:", e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
