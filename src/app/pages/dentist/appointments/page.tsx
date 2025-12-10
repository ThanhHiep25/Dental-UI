'use client';

import React, { useEffect, useState } from 'react';
import http from '@/services/http';
import { useRouter } from 'next/navigation';

interface Appointment {
    id: number;
    status: string;
    scheduledTime: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
    customerId?: number;
    customerUsername?: string;
    customerEmail?: string;
    customerEmergencyContact?: string;
    dentistId?: number;
    dentistUsername?: string;
    serviceId?: number;
    serviceName?: string;
}

const DentistAppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // basic role check: if user in localStorage is not DENTIST redirect to home
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.role !== 'DENTIST') {
                    router.push('/');
                    return;
                }
            } else {
                router.push('/');
                return;
            }
        } catch {
            router.push('/');
            return;
        }

        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await http.get('/api/appointments/my');
            const json = res.data;
            if (json && Array.isArray(json.data)) {
                setAppointments(json.data);
            } else {
                setError('Unexpected response from server');
            }
        } catch (err) {
            console.error('Failed to load appointments', err);
            const message = err instanceof Error ? err.message : String(err);
            setError(message || 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">My Appointments</h1>

            <div className="mb-4 flex gap-2">
                <button onClick={fetchAppointments} className="px-4 py-2 bg-purple-600 text-white rounded">Refresh</button>
                <button onClick={() => router.push('/')} className="px-4 py-2 border rounded">Back</button>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && appointments.length === 0 && <div>No appointments found.</div>}

            <ul className="space-y-4">
                {appointments.map((a) => (
                    <li key={a.id} className="border p-4 rounded shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-lg font-semibold">{a.serviceName || 'Unknown service'}</div>
                                <div className="text-sm text-gray-600">Customer: {a.customerUsername || '—'}</div>
                                {a.customerEmail && <div className="text-sm text-gray-600">Email: {a.customerEmail}</div>}
                                {a.customerEmergencyContact && <div className="text-sm text-gray-600">Emergency contact: {a.customerEmergencyContact}</div>}
                                <div className="text-sm text-gray-600">Notes: <span className="whitespace-pre-wrap">{a.notes || '—'}</span></div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Status: {a.status}</div>
                                <div className="text-sm text-gray-700 font-medium">{a.scheduledTime ? new Date(a.scheduledTime).toLocaleString() : '—'}</div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DentistAppointmentsPage;