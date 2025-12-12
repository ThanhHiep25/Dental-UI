'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getServices, Service } from '@/services/services';
// dentist selection removed per request
import { sendConsultation, quickBooking, validateQuickBooking, QuickBookingPayload } from '@/services/appointment';
import { UserAPI, ApiResponse, UserProfile } from '@/services/user';
import { Dentist, DentistAPI } from '@/services/dentist';
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
                                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={todayIso} className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-purple-700">Giờ</label>
                                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} min="08:00" max="20:00" className="w-full mt-1 p-3 border-b-2 border-b-yellow-400 border-gray-300 focus:outline-none" required />
                                    </div>
                                </div>

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
