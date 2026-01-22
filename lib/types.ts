// Shared interfaces for Client and Server data exchange

export interface LocalTicket {
    id: string; // UUID from client
    tempId?: string;
    municipioId: string;
    servicioId: string;
    infraccionId: string;
    calle: string;
    ciudad: string;
    fechaInicio: Date;
    fechaFin?: Date;
    policiaPlaca?: string;
    policiaFirma?: string; // Blob or Base64
    synced: boolean;
    createdAt: Date;
}

export interface LocalVehicle {
    id: string;
    localTicketId: string;
    matricula: string;
    marca: string;
    modelo: string;
    esMoto: boolean;
    esSobrepeso: boolean;
    fotos: string[]; // Blob URLs or Base64
}

export interface OfflineMasterData {
    id: string; // 'municipios', 'servicios', 'infracciones', 'marcas'
    data: any;  // JSON content
    updatedAt: Date;
}
