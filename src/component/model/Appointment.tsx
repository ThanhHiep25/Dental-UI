'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getServices, Service } from '@/services/services';
// dentist selection removed per request
import { sendConsultation, quickBooking, validateQuickBooking, QuickBookingPayload } from '@/services/appointment';
import { UserAPI, ApiResponse, UserProfile } from '@/services/user';
import { Dentist, DentistAPI, DentistDayData, DentistAppointment } from '@/services/dentist';
import { Branch, BranchAPI } from '@/services/branches';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'consultation' | 'appointment';
    // When provided, try to preselect a service whose description or name matches this slug
    defaultServiceSlug?: string;
    // Optional: prefer preselect by id when pages know the service id
    defaultServiceId?: number;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    isOpen,
    onClose,
    defaultTab,
    defaultServiceSlug,
    defaultServiceId,
}) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('consultation');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dentistId, setDentistId] = useState<number | ''>('');
    const [branchId, setBranchId] = useState<number | ''>('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    const [serviceId, setServiceId] = useState<number | ''>('');

    const [consultationMethod, setConsultationMethod] = useState('Zalo');
    const [consultationContent, setConsultationContent] = useState('');

    // State for available time slots
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Slots that are booked
    const [pastSlots, setPastSlots] = useState<string[]>([]); // Slots that are in the past (for today)
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [dentistDayData, setDentistDayData] = useState<DentistDayData | null>(null);

    // Working hours configuration (8:00 - 20:00)
    const WORK_START_HOUR = 8;
    const WORK_END_HOUR = 20;
    const SLOT_INTERVAL_MINUTES = 30; // 30-minute slots

    // Calculate all time slots and categorize them
    const calculateAllSlots = useCallback((appointments: DentistAppointment[], selectedDate: string): { available: string[], booked: string[], past: string[] } => {
        const available: string[] = [];
        const booked: string[] = [];
        const past: string[] = [];
        const now = new Date();
        const selectedDateObj = new Date(selectedDate);
        const isToday = selectedDateObj.toDateString() === now.toDateString();

        // Generate all possible slots from 8:00 to 20:00
        for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
            for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
                const slotTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                
                // If today, check if slot is in the past
                if (isToday) {
                    const slotDateTime = new Date(selectedDate);
                    slotDateTime.setHours(hour, minute, 0, 0);
                    if (slotDateTime <= now) {
                        past.push(slotTime);
                        continue;
                    }
                }

                // Check if this slot conflicts with any appointment
                let isBooked = false;
                const slotStart = hour * 60 + minute; // in minutes from midnight
                const slotEnd = slotStart + SLOT_INTERVAL_MINUTES; // slot end time

                for (const apt of appointments) {
                    // Parse appointment times (they are in UTC, need to convert to local)
                    const aptStart = new Date(apt.scheduledTime);
                    const aptEnd = new Date(apt.endTime);
                    
                    // Convert to local minutes from midnight
                    const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
                    const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();

                    // Check overlap: Two intervals [A, B) and [C, D) overlap if A < D AND C < B
                    // Slot interval: [slotStart, slotEnd)
                    // Appointment interval: [aptStartMinutes, aptEndMinutes)
                    // They overlap if: slotStart < aptEndMinutes AND aptStartMinutes < slotEnd
                    if (slotStart < aptEndMinutes && aptStartMinutes < slotEnd) {
                        isBooked = true;
                        break;
                    }
                }

                if (isBooked) {
                    booked.push(slotTime);
                } else {
                    available.push(slotTime);
                }
            }
        }

        return { available, booked, past };
    }, []);

    // Fetch dentist appointments when date or dentistId changes
    useEffect(() => {
        if (!isOpen || !date || dentistId === '') {
            setAvailableSlots([]);
            setBookedSlots([]);
            setPastSlots([]);
            setDentistDayData(null);
            return;
        }

        const fetchDentistSchedule = async () => {
            setLoadingSlots(true);
            try {
                const res = await DentistAPI.getDentistsByDay(date);
                if (res.success && res.data) {
                    const dentistData = res.data.find(d => d.dentistId === Number(dentistId));
                    if (dentistData) {
                        setDentistDayData(dentistData);
                        const { available, booked, past } = calculateAllSlots(dentistData.appointments, date);
                        setAvailableSlots(available);
                        setBookedSlots(booked);
                        setPastSlots(past);
                    } else {
                        // Dentist not found in response, assume all slots available
                        setDentistDayData(null);
                        const { available, booked, past } = calculateAllSlots([], date);
                        setAvailableSlots(available);
                        setBookedSlots(booked);
                        setPastSlots(past);
                    }
                } else {
                    setAvailableSlots([]);
                    setBookedSlots([]);
                    setPastSlots([]);
                    setDentistDayData(null);
                }
            } catch (err) {
                console.error('Failed to fetch dentist schedule', err);
                setAvailableSlots([]);
                setBookedSlots([]);
                setPastSlots([]);
                setDentistDayData(null);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchDentistSchedule();
    }, [isOpen, date, dentistId, calculateAllSlots]);

    // client-side min date for date input (YYYY-MM-DD)
    const todayIso = new Date().toISOString().slice(0, 10);
    const formatDateForBackend = (isoDate: string) => {
        if (!isoDate) return isoDate;
        // Normalize various input forms (yyyy-MM-dd, dd-MM-yyyy, dd/MM/yyyy) -> yyyy-MM-dd
        const parts = isoDate.split(/[-\/]/).map(s => s.trim());
        if (parts.length === 3) {
            let y = parts[0], m = parts[1], d = parts[2];
            // detect year position
            if (parts[0].length === 4) {
                // already yyyy-MM-dd
                y = parts[0]; m = parts[1]; d = parts[2];
            } else if (parts[2].length === 4) {
                // dd-MM-yyyy or dd/MM/yyyy
                y = parts[2]; m = parts[1]; d = parts[0];
            }
            const pad = (s: string) => s.padStart(2, '0');
            return `${y}-${pad(m)}-${pad(d)}`;
        }
        return isoDate;
    };

    // Normalize string for loose matching
    const toNorm = (v?: string) => (v || '').toLowerCase().replace(/[_-]+/g, ' ').trim();

    useEffect(() => {
        if (!isOpen) return;

        (async () => {
            try {
                const list = await getServices();
                setServices(list);
            } catch (err) {
                console.error('Failed to load services', err);
            }
        })();


        (async () => {
            try {
                const res = await DentistAPI.getDentists();
                if (res.success && res.data) {
                    setDentists(res.data);
                }
            } catch (err) {
                console.error('Failed to load dentists', err);
            }
        })();

        (async () => {
            try {
                const res = await BranchAPI.getBranches();
                if (res && res.success && res.data) {
                    setBranches(res.data);
                }
            } catch (err) {
                console.error('Failed to load branches', err);
            }
        })();


        (async () => {
            try {
                const meRes = await UserAPI.getMe();
                // meRes may be ApiResponse<UserMe> or raw UserMe
                const me = meRes?.data ?? meRes;
                const uid = me?.id;
                if (!uid) return;

                // prefer profile phone if available
                let profilePhone: string | undefined;
                try {
                    const profileRes = (await UserAPI.getProfile(uid)) as ApiResponse<UserProfile> | undefined;
                    if (profileRes && profileRes.success) {
                        profilePhone = profileRes.data?.phone as string | undefined;
                    }
                } catch (innerErr) {
                    console.debug('Failed to load user profile', innerErr);
                }

                const fullName = me?.fullName ?? me?.username ?? '';
                const emailVal = me?.email ?? '';
                const phoneVal = profilePhone ?? me?.phone ?? '';

                // Only auto-fill if fields are empty (so manual edits aren't overwritten)
                if (!name && fullName) setName(fullName);
                if (!email && emailVal) setEmail(emailVal);
                if (!phone && phoneVal) setPhone(phoneVal);
            } catch (error) {
                console.debug('User not logged in or failed to fetch user', error);
            }
        })();
    }, [isOpen, name, email, phone]);

    // When opening, set default tab if provided
    useEffect(() => {
        if (isOpen && defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [isOpen, defaultTab]);

    // Preselect service by slug or name when available
    useEffect(() => {
        if (!isOpen) return;
        // If a numeric id was provided prefer that (most robust)
        if (typeof defaultServiceId === 'number' && serviceId === '') {
            const byId = services.find(s => s.id === defaultServiceId);
            if (byId) {
                setServiceId(byId.id);
                return;
            }
        }

        if (!defaultServiceSlug) return;
        if (serviceId !== '') return; // already selected
        if (!services || services.length === 0) return;

        const slug = toNorm(defaultServiceSlug);
        const match = services.find(s => {
            // allow matching against name, description, or an explicit slug field
            const nameNorm = toNorm(s.name);
            const descNorm = toNorm(s.description);
            const meta = s as Service & Record<string, unknown>;
            const slugFieldRaw = meta.slug ?? meta.code ?? '';
            const slugField = toNorm(String(slugFieldRaw || ''));

            // exact matches
            if (nameNorm === slug) return true;
            if (descNorm === slug) return true;
            if (slugField === slug) return true;

            // partial includes (looser match)
            if (nameNorm.includes(slug)) return true;
            if (descNorm.includes(slug)) return true;
            if (slugField.includes(slug)) return true;

            // also allow passing numeric id as slug string
            if (!Number.isNaN(Number(defaultServiceSlug)) && Number(defaultServiceSlug) === s.id) return true;
            return false;
        });

        if (match) setServiceId(match.id);
    }, [isOpen, defaultServiceSlug, services, serviceId, defaultServiceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);


            if (activeTab === 'consultation') {
                const payload = {
                    fullName: name,
                    email,
                    phone,
                    method: consultationMethod,
                    content: consultationContent || notes,
                    branchId: Number(branchId) || undefined,
                };
                const json = await sendConsultation(payload);
                if (json && json.success) {
                    toast.success('Thông tin tư vấn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    setName('');
                    setEmail('');
                    setPhone('');
                    setConsultationMethod('Zalo');
                    setConsultationContent('');
                    setNotes('');
                    setBranchId('');
                    //  setTimeout(() => onClose(), 1200);
                } else {
                    const msg = json?.message || 'Gửi tư vấn thất bại';
                    toast.error(msg, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                }
                return;
            }

            if (activeTab === 'appointment') {
                // Build robust scheduled time representations to avoid device timezone/parsing issues.
                const buildScheduledIsoAndLocal = (dateStr: string, timeStr: string) => {
                    const pad = (n: number) => String(n).padStart(2, '0');
                    // Accept common separators and orders: YYYY-MM-DD (native date input), DD-MM-YYYY or DD/MM/YYYY
                    const partsRaw = (dateStr || '').split(/[-\/]/).map(s => Number(s));
                    let y = 0, m = 1, d = 1;
                    if (partsRaw.length === 3) {
                        // If first part looks like a year (>= 1000) assume YYYY-M-D
                        if (partsRaw[0] >= 1000) {
                            y = partsRaw[0]; m = partsRaw[1]; d = partsRaw[2];
                        } else if (partsRaw[2] >= 1000) {
                            // if last part looks like a year assume D-M-YYYY
                            y = partsRaw[2]; m = partsRaw[1]; d = partsRaw[0];
                        } else {
                            // Fallback to Y-M-D if ambiguous
                            y = partsRaw[0]; m = partsRaw[1]; d = partsRaw[2];
                        }
                    }

                    const [hh, mm] = (timeStr || '00:00').split(':').map(s => Number(s));
                    // Construct a Date using numeric components (interpreted as local time)
                    const localDt = new Date(y || 0, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
                    const iso = localDt.toISOString(); // canonical UTC ISO string

                    const scheduledLocal = `${y}-${pad(m || 1)}-${pad(d || 1)} ${pad(hh || 0)}:${pad(mm || 0)}`;
                    // timezone offset like +07:00
                    const offsetMin = -localDt.getTimezoneOffset();
                    const sign = offsetMin >= 0 ? '+' : '-';
                    const offH = pad(Math.floor(Math.abs(offsetMin) / 60));
                    const offM = pad(Math.abs(offsetMin) % 60);
                    const scheduledLocalWithOffset = `${scheduledLocal} ${sign}${offH}:${offM}`;
                    return { iso, scheduledLocal, scheduledLocalWithOffset };
                };

                const { iso, scheduledLocalWithOffset } = buildScheduledIsoAndLocal(date, time);

                const payload: QuickBookingPayload = {
                    fullName: name,
                    email,
                    phone,
                    serviceId: Number(serviceId) || 0,
                    dentistId: Number(dentistId) || undefined,
                    branchId: Number(branchId) || undefined,
                    date: formatDateForBackend(date),
                    time,
                    // add a canonical ISO scheduled time and a localized representation with timezone offset
                    scheduledTime: iso,
                    scheduledLocal: scheduledLocalWithOffset,
                    notes,
                };
                // runtime validate before sending
                try {
                    const validation = validateQuickBooking(payload);
                    if (!validation.valid) {
                        const msg = validation.errors.join('; ');

                        toast.error(msg, { position: 'top-right', autoClose: 5000, theme: 'light' });
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Validation error', err);
                }

                const json = await quickBooking(payload);
                if (json && json.success) {
                    const msg = 'Lịch hẹn của bạn đã được đặt thành công. Chúng tôi sẽ liên hệ xác nhận với bạn sớm nhất';
                    toast.success(msg, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                    //setTimeout(() => onClose(), 1200);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setDentistId('');
                    setBranchId('');
                    setServiceId('');
                    setDate('');
                    setTime('');
                    setNotes('');
                } else {
                    const msg = json?.message || 'Đặt hẹn thất bại';
                    toast.error(msg, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });
                }
                return;
            }
        } catch (err) {
            console.error('Submit error', err);
            toast.error('Lỗi mạng hoặc máy chủ', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        } finally {
            setLoading(false);
        }
    };

    const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const modalVariants = {
        hidden: { y: '50vh', opacity: 0 },
        visible: { y: '0', opacity: 1, transition: { duration: 0.4, damping: 25, stiffness: 500 } },
        exit: { y: '100vh', opacity: 0 },
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
            >
                <motion.div
                    className="bg-white p-8 rounded-3xl shadow-xl w-full md:max-w-4xl max-w-lg mx-auto relative h-full md:h-auto"
                    variants={modalVariants}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-8 cursor-pointer text-gray-400 hover:text-white hover:bg-gray-400 backdrop-blur-2xl rounded-full transition-colors flex items-center gap-2 p-2"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6 hover:bg-red-500 rounded-2xl " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Đóng
                    </button>

                    {/* Header Tab */}
                    <div className="flex justify-center mb-6 mt-5 border-b border-gray-200">
                        <button
                            className={`py-2 px-4 font-semibold w-full relative ${activeTab === 'consultation' ? 'text-white bg-purple-500 rounded-md' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('consultation')}
                        >
                            Tư vấn
                            {activeTab === 'consultation' && <motion.div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-purple-600 rounded-t-lg" layoutId="underline" />}
                        </button>

                        <button
                            className={`py-2 px-4 font-semibold w-full relative ${activeTab === 'appointment' ? 'text-white bg-purple-500 rounded-md' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('appointment')}
                        >
                            Đặt lịch hẹn
                            {activeTab === 'appointment' && <motion.div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-purple-600 rounded-t-lg" layoutId="underline" />}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'consultation' && (
                            <motion.form key="consultation" onSubmit={handleSubmit} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="space-y-4 overflow-y-auto h-[70vh] scrollbar-hide overflow-x-hidden">
                                <div className="flex items-center gap-1">
                                    <motion.img src="/IMGLADING/Camtudental-doctor-holding-phone-to-support-customers-797x1024.png" alt="Image" className='w-20 h-40 object-cover' />
                                    <h1 className='md:text-5xl text-5xl roboto-900 bg-clip-text bg-gradient-to-bl from-purple-600 via-yellow-400 to-purple-600 text-transparent mb-4'>Tư vấn dịch vụ nha khoa</h1>
                                </div>

                                <div className="md:flex md:items-center md:justify-between md:gap-10">
                                    <div className="mt-5 md:w-full">
                                        <label className="block text-purple-700">Họ và tên</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-3 border-b border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                    <div className="mt-5 md:w-full">
                                        <label className="block text-purple-700">Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 border-b border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                </div>

                                <div className="mt-5 md:flex md:items-center md:justify-between md:gap-10">
                                    <div className="mt-5 md:w-full">
                                        <label className="block text-purple-700">Số điện thoại</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-3 border-b border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>


                                    <div className="md:w-full mt-5">
                                        <h3 className="text-purple-700 mb-4">Phương thức tư vấn</h3>
                                        <div className="w-full flex flex-wrap gap-4 items-center">
                                            {/* Tiêu đề cho các tùy chọn radio */}


                                            {/* Nhóm các radio buttons */}
                                            <div className="flex flex-wrap gap-4">
                                                {/* Radio button cho Zalo */}
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="consultationMethod"
                                                        value="Zalo"
                                                        checked={consultationMethod === "Zalo"}
                                                        onChange={(e) => setConsultationMethod(e.target.value)}
                                                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                    />
                                                    <span className="text-yellow-500">Zalo</span>
                                                </label>

                                                {/* Radio button cho Hotline */}
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="consultationMethod"
                                                        value="Hotline"
                                                        checked={consultationMethod === "Hotline"}
                                                        onChange={(e) => setConsultationMethod(e.target.value)}
                                                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                    />
                                                    <span className="text-yellow-500">Hotline</span>
                                                </label>

                                                {/* Radio button cho Email */}
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="consultationMethod"
                                                        value="Email"
                                                        checked={consultationMethod === "Email"}
                                                        onChange={(e) => setConsultationMethod(e.target.value)}
                                                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                    />
                                                    <span className="text-yellow-500">Email</span>
                                                </label>

                                                {/* Radio button cho Phone */}
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name="consultationMethod"
                                                        value="Phone"
                                                        checked={consultationMethod === "Phone"}
                                                        onChange={(e) => setConsultationMethod(e.target.value)}
                                                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                                    />
                                                    <span className="text-yellow-500">Phone</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 md:w-full">
                                    <label className="block text-purple-700">Chi nhánh (tuỳ chọn)</label>
                                    <select value={branchId} onChange={(e) => setBranchId(e.target.value === '' ? '' : Number(e.target.value))} className="w-full mt-1 p-3 rounded-md border border-yellow-400 focus:outline-none">
                                        <option value="">Chọn chi nhánh</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}{b.address ? ` - ${b.address}` : ''}</option>)}
                                    </select>
                                </div>

                                <div className="mt-5">
                                    <label className="block text-purple-700">Nội dung tư vấn</label>
                                    <textarea value={consultationContent || notes} onChange={(e) => { setConsultationContent(e.target.value); setNotes(e.target.value); }} rows={4} className="w-full mt-1 p-3 border border-yellow-400 rounded-2xl focus:outline-none " />
                                </div>

                                {/* {feedback && <div className={`p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{feedback.message}</div>} */}

                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full bg-purple-600 text-white font-semibold py-3 rounded-md transition duration-300 hover:bg-purple-700" disabled={loading}>
                                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
                                </motion.button>
                            </motion.form>
                        )}

                        {activeTab === 'appointment' && (
                            <motion.form key="appointment" onSubmit={handleSubmit} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-4 overflow-y-auto h-[70vh] scrollbar-hide overflow-x-hidden">
                                <div className="flex items-center gap-1">
                                    <motion.img src="/IMGLADING/Camtudental-doctor-holding-phone-to-support-customers-797x1024.png" alt="Image" className='w-20 h-40 object-cover' />
                                    <h1 className='md:text-5xl text-5xl roboto-900 bg-clip-text bg-gradient-to-bl from-purple-600 via-yellow-400 to-purple-600 text-transparent mb-4'>Vui lòng điền thông tin đặt hẹn</h1>
                                </div>

                                <div className="md:flex md:items-center md:justify-between md:gap-10">
                                    <div className="md:w-full">
                                        <label className="block text-purple-700">Họ và tên</label>
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                    <div className="md:w-full">
                                        <label className="block text-purple-700">Email</label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                </div>

                                <div className="md:flex md:items-center md:justify-between md:gap-10">
                                    <div className="md:w-full">
                                        <label className="block text-purple-700">Số điện thoại</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>

                                    <div className="md:w-full">
                                        <h3 className="text-purple-700 mb-4">Chọn dịch vụ</h3>
                                        <select value={serviceId} onChange={(e) => setServiceId(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full p-3 rounded-md border border-yellow-400 focus:outline-none" required>
                                            <option value="">Chọn dịch vụ</option>
                                            {services.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                    {typeof s.price === 'number' ? ` - ${s.price.toLocaleString('vi-VN')}đ` : ''}
                                                    {typeof s.durationMinutes === 'number' ? ` • ${s.durationMinutes} phút` : ''}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Thông tin dịch vụ đã chọn */}
                                        {serviceId !== '' && (
                                            (() => {
                                                const svc = services.find(s => s.id === Number(serviceId));
                                                if (!svc) return null;
                                                return (
                                                    <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-sm text-gray-700">
                                                        <div className="font-semibold text-purple-800">{svc.name}</div>
                                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                                            {typeof svc.price === 'number' && (
                                                                <span className="inline-flex items-center gap-1 text-purple-700">
                                                                    <span className="font-medium">Giá:</span> {svc.price.toLocaleString('vi-VN')}đ
                                                                </span>
                                                            )}
                                                            {typeof svc.durationMinutes === 'number' && (
                                                                <span className="inline-flex items-center gap-1 text-purple-700">
                                                                    <span className="font-medium">Thời lượng:</span> {svc.durationMinutes} phút
                                                                </span>
                                                            )}
                                                        </div>
                                                        {svc.description && (
                                                            <p className="mt-1 text-gray-600">{svc.description}</p>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>

                                </div>
                                <div className="md:flex md:items-center flex-col md:justify-between md:gap-10">
                                    <div className="md:w-full">
                                        <h3 className="text-purple-700 mb-4">Chọn nha sĩ</h3>
                                        <select value={dentistId} onChange={(e) => setDentistId(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full p-3 rounded-md border border-yellow-400 focus:outline-none"
                                            required>
                                            <option value="">Chọn nha sĩ</option>
                                            {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}{d.specialization ? ` - ${d.specialization}` : ''}</option>)}
                                        </select>
                                    </div>

                                    {/* Thông tin nha sĩ được chọn */}
                                    {dentistId !== '' && (
                                        <>
                                            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-sm text-gray-700 md:w-full">
                                                {(() => {
                                                    const dent = dentists.find(d => d.id === Number(dentistId));
                                                    if (!dent) return null;
                                                    return (
                                                        <div>
                                                            <div className="font-semibold text-purple-800">{dent.name}</div>
                                                            <div className="mt-1 flex flex-col gap-x-4 gap-y-1">
                                                                <span className="inline-flex items-center gap-1 text-purple-700">
                                                                    <span className="font-medium">Email:</span> {dent.email}
                                                                </span>
                                                                <span className="inline-flex items-center gap-1 text-purple-700"></span>
                                                                {/* <span className="font-medium">Sđt: {dent.phone}</span> */}
                                                            </div>
                                                            {dent.specialization && (
                                                                <p className="mt-1 text-gray-600">{dent.specialization}</p>

                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="md:w-full mt-4">
                                    <label className="block text-purple-700">Chi nhánh</label>
                                    <select value={branchId} onChange={(e) => setBranchId(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full p-3 rounded-md border border-yellow-400 focus:outline-none" required>
                                        <option value="">Chọn chi nhánh</option>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}{b.address ? ` - ${b.address}` : ''}</option>)}
                                    </select>
                                </div>


                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-purple-700">Ngày</label>
                                        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(''); }} min={todayIso} className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-purple-700">Giờ</label>
                                        <input type="time" readOnly value={time} onChange={(e) => setTime(e.target.value)} min="08:00" max="20:00" className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                </div>

                                {/* Available Time Slots */}
                                {date && dentistId !== '' && (
                                    <div className="mt-4">
                                        <label className="block text-purple-700 mb-2">
                                            Chọn khung giờ
                                            {dentistDayData && (
                                                <span className="text-sm text-gray-500 ml-2">
                                                    ({dentistDayData.totalAppointments} lịch hẹn trong ngày)
                                                </span>
                                            )}
                                        </label>

                                        {/* Legend */}
                                        <div className="flex flex-wrap gap-4 mb-3 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="w-4 h-4 rounded bg-white border border-purple-300"></span>
                                                <span className="text-gray-600">Còn trống</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-4 h-4 rounded bg-red-100 border border-red-300"></span>
                                                <span className="text-gray-600">Đã có lịch</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></span>
                                                <span className="text-gray-600">Đã qua</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-4 h-4 rounded bg-purple-600"></span>
                                                <span className="text-gray-600">Đang chọn</span>
                                            </div>
                                        </div>
                                        
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center py-4">
                                                <svg className="animate-spin h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="ml-2 text-gray-600">Đang tải lịch...</span>
                                            </div>
                                        ) : (availableSlots.length > 0 || bookedSlots.length > 0 || pastSlots.length > 0) ? (
                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-purple-200 rounded-xl bg-purple-50/30">
                                                {/* Past slots - disabled and grayed out */}
                                                {pastSlots.map((slot) => (
                                                    <div
                                                        key={`past-${slot}`}
                                                        className="p-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed line-through text-center"
                                                        title="Khung giờ đã qua"
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                                
                                                {/* Generate slots in order from 8:00 to 20:00 */}
                                                {(() => {
                                                    const allSlots: { time: string; status: 'available' | 'booked' | 'past' }[] = [];
                                                    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
                                                        for (let minute = 0; minute < 60; minute += SLOT_INTERVAL_MINUTES) {
                                                            const slotTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                                                            if (pastSlots.includes(slotTime)) {
                                                                allSlots.push({ time: slotTime, status: 'past' });
                                                            } else if (bookedSlots.includes(slotTime)) {
                                                                allSlots.push({ time: slotTime, status: 'booked' });
                                                            } else if (availableSlots.includes(slotTime)) {
                                                                allSlots.push({ time: slotTime, status: 'available' });
                                                            }
                                                        }
                                                    }
                                                    return allSlots.map((slot) => {
                                                        if (slot.status === 'past') {
                                                            return (
                                                                <div
                                                                    key={`slot-${slot.time}`}
                                                                    className="p-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed line-through text-center"
                                                                    title="Khung giờ đã qua"
                                                                >
                                                                    {slot.time}
                                                                </div>
                                                            );
                                                        }
                                                        if (slot.status === 'booked') {
                                                            return (
                                                                <div
                                                                    key={`slot-${slot.time}`}
                                                                    className="p-2 rounded-lg text-sm font-medium bg-red-100 text-red-400 border border-red-300 cursor-not-allowed text-center relative"
                                                                    title="Nha sĩ đã có lịch hẹn"
                                                                >
                                                                    {slot.time}
                                                                    <svg className="w-3 h-3 absolute top-1 right-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            );
                                                        }
                                                        // Available slot
                                                        return (
                                                            <motion.button
                                                                key={`slot-${slot.time}`}
                                                                type="button"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setTime(slot.time)}
                                                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                                    time === slot.time
                                                                        ? 'bg-purple-600 text-white shadow-md'
                                                                        : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
                                                                }`}
                                                            >
                                                                {slot.time}
                                                            </motion.button>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-orange-600 bg-orange-50 rounded-xl border border-orange-200">
                                                <svg className="w-8 h-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                Nha sĩ đã kín lịch trong ngày này. Vui lòng chọn ngày khác.
                                            </div>
                                        )}

                                        {/* Show dentist's booked appointments for reference */}
                                        {dentistDayData && dentistDayData.appointments.length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <p className="text-sm text-gray-600 font-medium mb-2">Chi tiết lịch đã đặt của nha sĩ:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {dentistDayData.appointments.map((apt) => {
                                                        const startTime = new Date(apt.scheduledTime);
                                                        const endTime = new Date(apt.endTime);
                                                        const startStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
                                                        const endStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
                                                        return (
                                                            <span
                                                                key={apt.id}
                                                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-lg"
                                                            >
                                                                {startStr} - {endStr}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hint when date or dentist not selected */}
                                {(!date || dentistId === '') && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-700 text-sm">
                                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Vui lòng chọn ngày và nha sĩ để xem khung giờ còn trống.
                                    </div>
                                )}

                                {/* {feedback && <div className={`p-3 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{feedback.message}</div>} */}

                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full mt-10 bg-purple-600 text-white font-semibold py-3 rounded-md transition duration-300 hover:bg-purple-700" disabled={loading}>
                                    {loading ? 'Đang gửi...' : 'Gửi yêu cầu hẹn'}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AppointmentModal;
