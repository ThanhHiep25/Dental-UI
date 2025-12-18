import http from '@/services/http';

/**
 * Quick booking payload sent to /api/public/quick-booking
 * date must be in yyyy-MM-dd format (e.g. 2025-11-08)
 */
export interface QuickBookingPayload {
    fullName: string;
    email?: string | null;
    phone: string;
    serviceId: number;
    // yyyy-MM-dd
    date: string;
    // HH:mm
    time: string;
    dentistId?: number | null;
    branchId?: number | null;
    notes?: string;
    // Optional extra time representations we may include for backend compatibility
    scheduledTime?: string; // local wall-clock (e.g. "2025-11-08 10:49 +07:00")
    scheduledTimeUtc?: string; // canonical UTC ISO
    scheduledLocal?: string; // localized string with offset (e.g. "2025-11-08 10:49 +07:00")
    scheduledLocalDB?: string; // DB-friendly naive timestamp
}

/**
 * Consultation payload sent to /api/public/consultation
 */
export interface ConsultationPayload {
    fullName: string;
    email?: string | null;
    phone: string;
    method: string;
    content: string;
    customerId?: number;
    dentistId?: number;
    assistantId?: number;
    branchId?: number;
    serviceId?: number;
    // scheduledDate format can be yyyy-MM-dd
    scheduledDate?: string;
    // scheduledTime e.g. HH:mm or full with offset
    scheduledTime?: string;
    durationMinutes?: number;
    notes?: string;
}

export interface AppointmentItem {
  id: number;
  label?: string;
  customerId?: number;
  customerUsername?: string;
  customerEmail?: string;
  customerName?: string | null;
  serviceId?: number;
  serviceName?: string;
  serviceDuration?: number | null;
  dentistId?: number;
  dentistRefId?: number;
  dentistName?: string;
  dentistUserId?: number;
  assistantId?: number;
  assistantUserId?: number;
  assistantName?: string;
  branchId?: number;
  branchName?: string;
  branchAddress?: string;
  scheduledTime?: string;
  estimatedMinutes?: number | null;
  notes?: string;
  status?: string;
  receptionistId?: number;
  receptionistUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}


export const sendConsultation = async (payload: ConsultationPayload) => {
    const res = await http.post('/api/public/consultation', payload);
    return res.data;
};

export const quickBooking = async (payload: QuickBookingPayload) => {
    const res = await http.post('/api/public/quick-booking', payload);
    return res.data;
};

/**
 * Simple runtime validator for quick booking payloads.
 * Returns { valid, errors } so callers can show friendly messages.
 */
export const validateQuickBooking = (payload: Partial<QuickBookingPayload>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!payload) {
        errors.push('Payload is required');
        return { valid: false, errors };
    }
    if (!payload.fullName || String(payload.fullName).trim() === '') errors.push('fullName is required');
    if (!payload.phone || String(payload.phone).trim() === '') errors.push('phone is required');
    if (typeof payload.serviceId !== 'number') errors.push('serviceId must be a number');
    // date must be yyyy-MM-dd
    if (!payload.date || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(payload.date)) {
        errors.push('Vui lòng chọn ngày hợp lệ');
    }
    // time must be HH:mm
    if (!payload.time || !/^[0-9]{2}:[0-9]{2}$/.test(payload.time)) {
        errors.push('Vui lòng chọn thời gian');
    }
    // If date and time formats are OK, enforce business rules: not in the past and within allowed hours
    if (payload.date && payload.time && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(payload.date) && /^[0-9]{2}:[0-9]{2}$/.test(payload.time)) {
        try {
            const [y, m, d] = payload.date.split('-').map(s => Number(s));
            const [hh, mm] = payload.time.split(':').map(s => Number(s));
            // Construct local Date from components
            const scheduled = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
            const now = new Date();
            if (isNaN(scheduled.getTime())) {
                errors.push('Ngày/giờ đặt lịch không hợp lệ');
            } else {
                if (scheduled.getTime() < now.getTime()) {
                    errors.push('Không thể đặt lịch hẹn trong quá khứ');
                }
                // allowed window: 08:00 - 20:00 (inclusive)
                const minutes = (hh || 0) * 60 + (mm || 0);
                const startMin = 8 * 60; // 08:00
                const endMin = 20 * 60; // 20:00
                if (minutes < startMin || minutes > endMin) {
                    errors.push('Thời gian đặt lịch phải trong khoảng từ 08:00 đến 20:00');
                }
            }
        } catch (err) {
            // include error in debug logs to help diagnose malformed inputs
            console.debug('validateQuickBooking parsing error', err);
            errors.push('Không thể xác thực ngày/giờ đặt lịch');
        }
    }
    // dentistId optional but if provided must be number (null is allowed)
    if (payload.dentistId !== undefined && payload.dentistId !== null && typeof payload.dentistId !== 'number') errors.push('dentistId must be a number when provided');

    return { valid: errors.length === 0, errors };
};

const appointmentService = {
    sendConsultation,
    quickBooking,
};

export default appointmentService;
