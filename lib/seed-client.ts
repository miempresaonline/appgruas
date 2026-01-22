import { db, OfflineMasterData } from './db';

const MOCK_MUNICIPIOS = [
    { id: 'm1', nombre: 'Madrid', cif: 'P-2807900-B' },
    { id: 'm2', nombre: 'Alcobendas', cif: 'P-2800600-J' },
    { id: 'm3', nombre: 'Pozuelo', cif: 'P-2811500-D' },
];

const MOCK_SERVICIOS = [
    { id: 's1', nombre: 'Arrastre (Grúa)', descripcion: 'Retirada estándar' },
    { id: 's2', nombre: 'Enganche', descripcion: 'Vehículo no retirado' },
    { id: 's3', nombre: 'Inicio Servicio', descripcion: 'Solo desplazamiento' },
];

const MOCK_INFRACCIONES = [
    { id: 'i1', codigo: '001', descripcion: 'Estacionamiento prohibido (Vado)' },
    { id: 'i2', codigo: '002', descripcion: 'Doble fila sin conductor' },
    { id: 'i3', codigo: '003', descripcion: 'Zona Carga/Descarga' },
];

const MOCK_MARCAS = [
    { id: 'ma1', nombre: 'Toyota' },
    { id: 'ma2', nombre: 'Seat' },
    { id: 'ma3', nombre: 'Ford' },
    { id: 'ma4', nombre: 'Renault' },
];

const MOCK_MODELOS = [
    { id: 'mo1', marcaId: 'ma1', nombre: 'Corolla' },
    { id: 'mo2', marcaId: 'ma1', nombre: 'Yaris' },
    { id: 'mo3', marcaId: 'ma2', nombre: 'Ibiza' },
    { id: 'mo4', marcaId: 'ma2', nombre: 'Leon' },
    { id: 'mo5', marcaId: 'ma3', nombre: 'Focus' },
    { id: 'mo6', marcaId: 'ma4', nombre: 'Megane' },
];

export async function seedMasterData() {
    // Check if data exists, if not, seed it.
    const exists = await db.masterData.get('municipios');
    if (!exists) {
        console.log('Seeding Master Data...');
        await db.masterData.bulkPut([
            { id: 'municipios', data: MOCK_MUNICIPIOS, updatedAt: new Date() },
            { id: 'servicios', data: MOCK_SERVICIOS, updatedAt: new Date() },
            { id: 'infracciones', data: MOCK_INFRACCIONES, updatedAt: new Date() },
            { id: 'marcas', data: MOCK_MARCAS, updatedAt: new Date() },
            { id: 'modelos', data: MOCK_MODELOS, updatedAt: new Date() },
        ]);
    }
}
