import http from '@/services/http';

export interface Service {
    id: number;
    name: string;
    price?: number;
    description?: string;
    durationMinutes?: number;
}

export const getServices = async (): Promise<Service[]> => {
    const res = await http.get('/api/services');
    const json = res.data;
    // Backend may return { data: [...] } or the array directly
    if (json && Array.isArray(json.data)) return json.data;
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.services)) return json.services;
    return [];
};

const servicesApi = {
    getServices,
};

export default servicesApi;
