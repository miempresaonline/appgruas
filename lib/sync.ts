'use client';

import { useEffect } from 'react';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSyncManager() {
    const pendingCount = useLiveQuery(() => db.tickets.where('synced').equals(0).count());

    useEffect(() => {
        const handleOnline = () => {
            console.log("Network Online. Attempting Sync...");
            syncTickets();
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    const syncTickets = async () => {
        const pending = await db.tickets.where('synced').equals(0).toArray();
        if (pending.length === 0) return;

        console.log(`Found ${pending.length} pending tickets.`);

        // Prepare payloads
        const payloads = [];
        for (const ticket of pending) {
            const vehicles = await db.vehicles.where('localTicketId').equals(ticket.id).toArray();
            payloads.push({ ...ticket, vehicles });
        }

        try {
            console.log("Syncing Tickets:", payloads.length);

            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloads)
            });

            if (!response.ok) {
                throw new Error(`Sync failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.results) {
                for (const res of data.results) {
                    if (res.status === 'synced' || res.status === 'already_synced') {
                        await db.tickets.update(res.id, { synced: true });
                        console.log("Ticket Synced Locally:", res.id);
                    } else {
                        console.error("Failed to sync ticket:", res.id, res.error);
                    }
                }
            }

        } catch (e) {
            console.error("Sync Process Failed:", e);
        }
    };

    return { pendingCount, syncTickets };
}
