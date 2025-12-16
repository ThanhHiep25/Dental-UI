'use client'
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { motion } from "framer-motion";
import { LoaderCircle, Undo2, Calendar, Clock, User, MapPin, Tag, QrCode, ChevronRightIcon, ChevronLeftIcon, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { UserAPI, UserMe, UserProfile, AppointmentHistory, Service, Dentist, ApiResponse } from '@/services/user';
import { AuthAPI, clearAuthTokens } from '@/services/auth';
import PaymentAPI from '@/services/payment';
import { PrescriptionAPI, Prescription } from '@/services/prescription';

const ProfilePage: React.FC = () => {
    const [userMe, setUserMe] = useState<UserMe | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [appointments, setAppointments] = useState<AppointmentHistory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isClient, setIsClient] = useState<boolean>(false);
    const [formData, setFormData] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string>('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // New states for appointment editing
    const [appointmentEditData, setAppointmentEditData] = useState<{
        scheduledTime?: string;
        notes?: string;
        serviceId?: number | null;
        dentistId?: number | null;
    } | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    // Sorting state for appointment history
    const [sortBy, setSortBy] = useState<'date' | 'dentist' | 'service' | null>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    // Status filter and pagination
    const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const PAGE_SIZE = 5;
    // Search / filter inputs
    const [serviceQuery, setServiceQuery] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>(''); // yyyy-mm-dd
    // detail modal state
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentHistory | null>(null);
    const [modalEditing, setModalEditing] = useState<boolean>(false);
    // Payment states
    const [paymentOpen, setPaymentOpen] = useState<boolean>(false);
    const [payAmount, setPayAmount] = useState<number>(0);
    const [payLoading, setPayLoading] = useState<boolean>(false);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    // Password reset state
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);


    const openPayment = async (appt: AppointmentHistory) => {
        setSelectedAppointment(appt);
        setSelectedPrescription(null);
        
        // Try to get price from multiple possible locations in the response
        // Priority: serviceTotalPrice > servicePrice > service.snapshotTotalPrice > service.snapshotPrice > service.price
        const svcPrice = appt.serviceTotalPrice 
            ?? appt.servicePrice 
            ?? appt.service?.snapshotTotalPrice 
            ?? appt.service?.snapshotPrice 
            ?? appt.service?.price 
            ?? 0;
        
        // Get duration from multiple possible locations
        const duration = appt.serviceDurationMinutes 
            ?? appt.serviceDuration 
            ?? appt.service?.snapshotDurationMinutes 
            ?? appt.service?.durationMinutes 
            ?? null;
        
        // Debug: Log appointment data to check prices
        console.log('===== PAYMENT MODAL OPENED =====');
        console.log('Full appointment object:', appt);
        console.log('Extracted pricing values:', {
            id: appt.id,
            serviceName: appt.serviceName,
            // Top-level fields
            servicePrice: appt.servicePrice,
            serviceTotalPrice: appt.serviceTotalPrice,
            serviceDurationMinutes: appt.serviceDurationMinutes,
            serviceDiscountPercent: appt.serviceDiscountPercent,
            // Nested service fields
            'service.price': appt.service?.price,
            'service.snapshotPrice': appt.service?.snapshotPrice,
            'service.snapshotTotalPrice': appt.service?.snapshotTotalPrice,
            'service.durationMinutes': appt.service?.durationMinutes,
            'service.snapshotDurationMinutes': appt.service?.snapshotDurationMinutes,
            // Calculated values
            svcPrice,
            duration,
            typeof_servicePrice: typeof appt.servicePrice,
            typeof_serviceTotalPrice: typeof appt.serviceTotalPrice
        });
        console.log('================================');
        
        // try to fetch prescriptions and find one for this appointment
        let foundPres: Prescription | null = null;
        try {
            const presRes = await PrescriptionAPI.getAll();
            if (presRes && presRes.success && Array.isArray(presRes.data)) {
                foundPres = presRes.data.find(p => Number(p.appointmentId) === Number(appt.id)) || null;
                if (foundPres) setSelectedPrescription(foundPres);
            }
        } catch (e) {
            console.debug('Failed to load prescriptions for payment', e);
        }
        const presAmt = (foundPres?.finalAmount ?? foundPres?.totalAmount) || 0;
        setPayAmount(Number(svcPrice || 0) + Number(presAmt || 0));
        setPaymentOpen(true);
    };

    const handleCreateVnPay = async () => {
        if (!selectedAppointment) return;
        const appointmentId = Number(selectedAppointment.id);
        const amount = Number(payAmount || 0);
        if (!amount || Number.isNaN(amount) || amount <= 0) {
            toast.error('Số tiền không hợp lệ');
            return;
        }
        setPayLoading(true);
        try {
            const res = await PaymentAPI.createVnPay({ appointmentId, amount, prescriptionId: selectedPrescription?.id });
            if (res && res.paymentUrl) {
                // redirect user to VNPay in current tab to allow callback to return
                window.location.href = res.paymentUrl;
                return;
            }
            if (res && res.success) {
                // server reports payment created without redirect — attempt to mark appointment complete and refresh
                try {
                    await UserAPI.updateAppointment(appointmentId, { status: 'COMPLETED' });
                    const historyRes = await UserAPI.getAppointmentHistory({ userId: userMe?.id });
                    try {
                        const hr = historyRes as unknown;
                        let maybeData: unknown = historyRes;
                        if (hr && typeof hr === 'object' && 'data' in (hr as Record<string, unknown>)) {
                            maybeData = (hr as Record<string, unknown>)['data'];
                        }
                        if (Array.isArray(maybeData)) setAppointments(maybeData as AppointmentHistory[]);
                    } catch { }
                } catch (e) {
                    console.warn('Failed to mark appointment complete after VNPay create', e);
                }
                toast.success('Thanh toán được tạo.');
                setPaymentOpen(false);
            } else {
                toast.error(res.message || 'Tạo liên kết thanh toán thất bại');
            }
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi tạo thanh toán VNPay');
        } finally {
            setPayLoading(false);
        }
    };

    const filteredSortedAppointments = useMemo(() => {
        // dentist name helper (not always present on record)
        const getServiceName = (rec: AppointmentHistory) =>
            (rec.serviceName ?? rec.service?.name ?? '').toLowerCase();

        let list = [...appointments];
        // filter by status if requested
        if (statusFilter && statusFilter !== 'ALL') {
            list = list.filter(a => (a.status || '').toUpperCase() === statusFilter.toUpperCase());
        }

        // filter by service name query
        const q = String(serviceQuery || '').trim().toLowerCase();
        if (q.length > 0) {
            list = list.filter(a => {
                const name = (a.serviceName ?? a.service?.name ?? '').toString().toLowerCase();
                return name.includes(q);
            });
        }

        // filter by specific scheduled date (local date string yyyy-mm-dd)
        if (dateFilter && dateFilter.length === 10) {
            // dateFilter is like '2025-09-15'
            const [yStr, mStr, dStr] = dateFilter.split('-');
            const y = Number(yStr);
            const m = Number(mStr);
            const d = Number(dStr);
            if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
                list = list.filter(a => {
                    if (!a.scheduledTime) return false;
                    const dt = new Date(a.scheduledTime);
                    return dt.getFullYear() === y && (dt.getMonth() + 1) === m && dt.getDate() === d;
                });
            }
        }

        list.sort((a, b) => {
            if (sortBy === 'service') {
                const A = getServiceName(a);
                const B = getServiceName(b);
                if (A < B) return sortDir === 'asc' ? -1 : 1;
                if (A > B) return sortDir === 'asc' ? 1 : -1;
                return 0;
            }
            // default: sort by created_at/createdAt (newest/oldest depending on sortDir)
            const getCreatedTime = (r: AppointmentHistory) => {
                const rRec = r as unknown as Record<string, unknown>;
                const raw = (rRec['createdAt'] as string | undefined) ?? (rRec['created_at'] as string | undefined) ?? (r.scheduledTime as string | undefined) ?? '';
                const t = new Date(raw).getTime();
                return Number.isNaN(t) ? 0 : t;
            };
            const ca = getCreatedTime(a);
            const cb = getCreatedTime(b);
            return sortDir === 'asc' ? ca - cb : cb - ca;
        });
        
        // Debug: Check if pricing data exists in filtered list
        if (list.length > 0) {
            console.log('Filtered appointments - first item pricing:', {
                id: list[0].id,
                servicePrice: list[0].servicePrice,
                serviceTotalPrice: list[0].serviceTotalPrice,
                serviceDurationMinutes: list[0].serviceDurationMinutes
            });
        }
        
        return list;
    }, [appointments, sortBy, sortDir, services, statusFilter, serviceQuery, dateFilter]);
    // Simple localized date-time formatter that is stable between SSR and CSR
    const formatDateTime = (iso?: string) => {
        if (!iso) return '-';
        try {
            const d = new Date(iso);
            if (isClient && typeof Intl !== 'undefined') {
                return d.toLocaleString();
            }
            // server fallback: ISO-like compact form
            return d.toISOString().replace('T', ' ').slice(0, 16);
        } catch {
            return iso || '-';
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredSortedAppointments.length / PAGE_SIZE));
    const paginatedAppointments = filteredSortedAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // ensure currentPage is within range when filtered list changes
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    // UI helpers
    const renderStatusBadge = (status?: string) => {
        const map: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        };
        const cls = (status && map[status]) || 'bg-gray-100 text-gray-800';
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
                {status}
            </span>
        );
    };

    useEffect(() => {
        // mark client after hydration to avoid SSR/CSR mismatch for locale-dependent rendering
        setIsClient(true);

        const fetchAll = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [meRes, profileRes, historyRes] = await Promise.all([
                    UserAPI.me(),
                    UserAPI.getProfile(),
                    UserAPI.getAppointmentHistory()
                ]);
                if (!meRes.success || !profileRes.success || !historyRes.success) {
                    setError('Không thể tải dữ liệu người dùng.');
                    setIsLoading(false);
                    return;
                }
                
                // Debug: Log raw API response for appointments
                console.log('Raw appointment history response:', historyRes);
                console.log('Appointment data sample:', historyRes.data?.[0]);
                
                setUserMe(meRes.data);
                setProfile(profileRes.data as UserProfile);
                setFormData(profileRes.data as UserProfile);
                
                const appointmentsArray = historyRes.data as AppointmentHistory[];
                console.log('Setting appointments array:', appointmentsArray);
                console.log('First appointment pricing:', {
                    servicePrice: appointmentsArray[0]?.servicePrice,
                    serviceTotalPrice: appointmentsArray[0]?.serviceTotalPrice,
                    serviceDurationMinutes: appointmentsArray[0]?.serviceDurationMinutes,
                    typeof_servicePrice: typeof appointmentsArray[0]?.servicePrice
                });
                setAppointments(appointmentsArray);
            } catch (err) {
                console.error(err);
                setError('Lỗi khi tải dữ liệu người dùng.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Helpers to fetch services and dentists when needed
    const fetchServicesAndDentists = async () => {
        try {
            const [svcRes, dRes] = await Promise.all([UserAPI.getServices(), UserAPI.getDentists()]);
            if (svcRes.success) setServices(svcRes.data);
            if (dRes.success) setDentists(dRes.data);
        } catch (e) {
            console.error('Failed to load services or dentists', e);
        }
    };

    const handleLazyResetPassword = async () => {
        if (!userMe) {
            toast.error('Không tìm thấy thông tin người dùng');
            return;
        }
        const usernameOrEmail = userMe.email || userMe.username;
        if (!usernameOrEmail) {
            toast.error('Thiếu email hoặc tên đăng nhập');
            return;
        }
        const pwd = newPassword.trim();
        const confirm = confirmPassword.trim();
        const strongPwdRegex = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-\\\[\]\/])[A-Z][A-Za-z0-9!@#$%^&*(),.?":{}|<>_\-\\\[\]\/]{7,}$/;
        setPasswordError('');
        if (!pwd || pwd.length < 8 || !strongPwdRegex.test(pwd)) {
            setPasswordError('Mật khẩu phải từ 8 ký tự, bắt đầu bằng chữ in hoa, có ít nhất 1 số và 1 ký tự đặc biệt');
            return;
        }
        if (pwd !== confirm) {
            setPasswordError('Mật khẩu xác nhận không khớp');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await AuthAPI.lazyResetPassword({ usernameOrEmail, newPassword: pwd });
            if (res?.success) {
                toast.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
                clearAuthTokens();
            } else {
                setPasswordError(res?.message || 'Đổi mật khẩu thất bại');
            }
        } catch (e) {
            console.error(e);
            setPasswordError('Lỗi khi đổi mật khẩu');
        } finally {
            setPasswordLoading(false);
        }
    };



    const handleAppointmentFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!appointmentEditData) return;
        const { name, value } = e.target;
        setAppointmentEditData({ ...appointmentEditData, [name]: value });
    };

    const saveAppointmentChanges = async (id: number) => {
        if (!appointmentEditData) return;
        setActionLoading(true);
        setError('');
        try {
            // convert datetime-local back to ISO
            const scheduledLocal = appointmentEditData.scheduledTime;
            let scheduledIso: string | undefined = undefined;
            if (scheduledLocal) {
                // scheduledLocal is like '2025-09-15T10:00'
                const localDate = new Date(scheduledLocal);
                scheduledIso = localDate.toISOString();
            }

            const payload: Record<string, unknown> = {};
            if (scheduledIso) payload.scheduledTime = scheduledIso;
            if (appointmentEditData.notes !== undefined) payload.notes = appointmentEditData.notes;
            if (appointmentEditData.serviceId) payload.service = { id: Number(appointmentEditData.serviceId) };
            // dentist is read-only in UI; do not include dentistId in update payload to avoid accidental changes

            const res = await UserAPI.updateAppointment(id, payload);
            if (res && res.success) {
                // refresh appointment list
                const historyRes = await UserAPI.getAppointmentHistory({ userId: userMe?.id });
                if (historyRes && historyRes.success) setAppointments(historyRes.data);
            } else {
                setError((res && res.message) || 'Cập nhật lịch hẹn thất bại.');
            }
            return res;
        } catch (err) {
            console.error(err);
            setError('Lỗi khi cập nhật lịch hẹn.');
            return undefined;
        } finally {
            setActionLoading(false);
        }
    };

    const cancelAppointment = async (id: number, status?: string) => {
        // Only allow cancelling when status is PENDING
        if (status && status !== 'PENDING') return;
        if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
        setActionLoading(true);
        setError('');
        try {
            const res = await UserAPI.cancelAppointment(id) as ApiResponse<unknown>;
            if (res && res.success) {
                // optimistic: remove from local list to reflect deletion immediately
                setAppointments(prev => prev.filter(a => a.id !== id));
                toast.success('Hủy lịch hẹn thành công');
            } else {
                const msg = (res && res.message) || 'Hủy lịch hẹn thất bại.';
                setError(msg);
                toast.error(msg);
            }
            return res;
        } catch (err) {
            console.error(err);
            setError('Lỗi khi hủy lịch hẹn.');
            toast.error('Lỗi khi hủy lịch hẹn.');
            return undefined;
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!formData) return;
        setIsLoading(true);
        setError('');
        // client-side validation
        const ok = validateForm(formData);
        if (!ok) {
            setIsLoading(false);
            setError('Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.');
            return;
        }
        try {
            const res = await UserAPI.updateProfile(formData);
            if (res.success) {
                setProfile(res.data);
                setFormData(res.data);
                setIsEditing(false);
            } else {
                setError(res.message || 'Cập nhật thông tin thất bại.');
            }
        } catch (err) {
            console.error(err);
            setError('Lỗi khi cập nhật thông tin.');
        } finally {
            setIsLoading(false);
        }
    };

    // Validation helpers
    const phoneRegex = /^(?:\+84|0)\d{9}$/; // +84xxxxxxxxx or 0xxxxxxxxx (10 digits)
    const validateForm = (data: UserProfile) => {
        const errs: Record<string, string> = {};
        // phone (optional but if present must match VN pattern)
        if (data.phone) {
            const cleaned = String(data.phone).trim();
            if (!phoneRegex.test(cleaned)) errs.phone = 'Số điện thoại không hợp lệ. Ví dụ: 0912345678 hoặc +84912345678';
        }
        // birthDate (optional but if present must be a valid date and reasonable age)
        if (data.birthDate) {
            const d = new Date(data.birthDate);
            if (Number.isNaN(d.getTime())) {
                errs.birthDate = 'Ngày sinh không hợp lệ.';
            } else {
                const age = new Date().getFullYear() - d.getFullYear();
                if (age < 0 || age > 120) errs.birthDate = 'Ngày sinh không hợp lệ.';
            }
        }
        // address (optional but reasonable length)
        if (data.address && String(data.address).trim().length > 0 && String(data.address).trim().length < 3) {
            errs.address = 'Địa chỉ quá ngắn.';
        }
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // input handler and cancel for profile editing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!formData) return;
        const { name, value } = e.target as HTMLInputElement;
        setFormData({ ...formData, [name]: value } as UserProfile);
    };

    const cancelEdit = () => {
        setFormData(profile);
        setIsEditing(false);
        setFormErrors({});
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <motion.img
                    src="/cardio-unscreen.gif"
                    alt="Loading..."
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-32 h-32"
                />
            </div>
        );
    }

    if (error || !userMe || !profile) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-red-500">{error || 'Không tìm thấy dữ liệu người dùng.'}</div>
            </div>
        );
    }

    // Variants cho các animation
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.2 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },

    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Top bar: back + title */}
                <div className="flex items-center gap-3 mb-4">
                    <motion.button
                        onClick={() => window.history.back()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className='h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border'
                        aria-label="Quay lại"
                    >
                        <Undo2 className="text-gray-600" size={18} />
                    </motion.button>
                    <div className="flex-1">
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-700">Hồ sơ của tôi</h1>
                        <p className="text-sm text-gray-500">Quản lý thông tin cá nhân và lịch hẹn của bạn</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-md shadow">Lưu</button>
                        ) : (
                            <button onClick={handleEdit} className="px-4 py-2 bg-white border rounded-md shadow-sm">Chỉnh sửa</button>
                        )}
                    </div>
                </div>

                <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
                    {/* Left / Hero */}
                    <motion.div className="col-span-1 bg-white rounded-2xl shadow-md p-4 sm:p-6" variants={itemVariants}>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-indigo-100 shadow-inner flex-shrink-0 relative">
                                <Image src={profile.avatarUrl || userMe.avatarUrl || '/images/default-avatar.jpg'} alt="avatar" fill sizes="96px" className="object-cover" />
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-3">

                                        <div>
                                            <label className="text-xs text-gray-500">Số điện thoại</label>
                                            <input name="phone" value={formData?.phone ?? profile.phone ?? ''} onChange={handleInputChange}
                                                className="w-full mt-1 p-2 border rounded-md text-sm" placeholder="0912345678" />
                                            {formErrors.phone && <div className="text-sm text-red-600 mt-1">{formErrors.phone}</div>}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Ngày sinh</label>
                                            <input name="birthDate" type="date" value={formData?.birthDate ?? profile.birthDate ?? ''} onChange={handleInputChange}
                                                className="w-full mt-1 p-2 border rounded-md text-sm" />
                                            {formErrors.birthDate && <div className="text-sm text-red-600 mt-1">{formErrors.birthDate}</div>}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Địa chỉ</label>
                                            <input name="address" value={formData?.address ?? profile.address ?? ''} onChange={handleInputChange}
                                                className="w-full mt-1 p-2 border rounded-md text-sm" placeholder="Địa chỉ" />
                                            {formErrors.address && <div className="text-sm text-red-600 mt-1">{formErrors.address}</div>}
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Giới tính</label>
                                            <div className="flex items-center gap-2">
                                                <button type="button" onClick={() => formData && setFormData({ ...formData, gender: 'male' })}
                                                    className={`px-3 py-1 rounded ${formData?.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>♂</button>
                                                <button type="button" onClick={() => formData && setFormData({ ...formData, gender: 'female' })}
                                                    className={`px-3 py-1 rounded ${formData?.gender === 'female' ? 'bg-pink-500 text-white' : 'bg-white border'}`}>♀</button>
                                                <button type="button" onClick={() => formData && setFormData({ ...formData, gender: 'other' })}
                                                    className={`px-3 py-1 rounded ${formData?.gender === 'other' ? 'bg-gray-700 text-white' : 'bg-white border'}`}>⚧</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-md">Lưu</button>
                                            <button onClick={cancelEdit} className="px-4 py-2 bg-gray-200 rounded-md">Hủy</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-800">{userMe.fullName || userMe.username || 'Chưa cập nhật tên'}</h2>
                                                <p className="text-sm text-gray-500">{userMe.email || 'Chưa cập nhật email'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div>
                                                <div className="text-xs text-gray-400">Số điện thoại</div>
                                                <div className="font-medium">{profile.phone || userMe.phone || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-400">Giới tính</div>
                                                <div className="font-medium">{(profile.gender || userMe.gender) || '-'}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <div className="text-xs text-gray-400">Địa chỉ</div>
                                                <div className="font-medium text-sm">{profile.address || userMe.address || '-'}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile action bar */}
                        <div className="mt-4 sm:hidden flex items-center gap-2">
                            {isEditing ? (
                                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md">Lưu</button>
                            ) : (
                                <button onClick={handleEdit} className="flex-1 px-4 py-2 bg-white border rounded-md">Chỉnh sửa</button>
                            )}
                        </div>

                        {/* show any validation errors */}
                        {Object.keys(formErrors).length > 0 && (
                            <div className="mt-3 text-sm text-red-600">Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.</div>
                        )}
                    </motion.div>

                    {/* Right top: supplemental info */}
                    <motion.div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4" variants={itemVariants}>
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm text-gray-500">Thông Tin Bổ Sung</h3>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="text-xs text-gray-400">Ngày tạo</div>
                                    <div className="font-medium">{userMe.createdAt ? formatDateTime(userMe.createdAt) : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Cập nhật</div>
                                    <div className="font-medium">{userMe.updatedAt ? formatDateTime(userMe.updatedAt) : '-'}</div>
                                </div>

                                <div className="mt-3">
                                    <div className="text-xs text-gray-400">ID: 1000918-{userMe.id}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600"><LockKeyhole size={18} /></span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">Đổi mật khẩu</h3>
                                        <p className="text-xs text-gray-500">Mật khẩu mới sẽ được áp dụng và các phiên cũ sẽ bị đăng xuất.</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPasswordModal(true)} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700">Đổi mật khẩu</button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Today's appointments (brief) */}
                    <motion.div className="col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-md p-4 sm:p-6" variants={itemVariants}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Lịch Hẹn Hôm Nay</h3>
                                <p className="text-sm text-gray-500">Các lịch hẹn có trong ngày hôm nay</p>
                            </div>
                            <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {/** compute todays appointments based on local date */}
                            {(() => {
                                const todayY = new Date().getFullYear();
                                const todayM = new Date().getMonth() + 1;
                                const todayD = new Date().getDate();
                                const todays = appointments.filter(a => {
                                    if (!a.scheduledTime) return false;
                                    const dt = new Date(a.scheduledTime);
                                    return dt.getFullYear() === todayY && (dt.getMonth() + 1) === todayM && dt.getDate() === todayD;
                                });

                                if (todays.length === 0) {
                                    return (<div className="text-center py-6 text-gray-500">Không có lịch hẹn hôm nay.</div>);
                                }

                                return todays.map(rec => (
                                    <div key={`today-${rec.id}`} className="bg-gray-50 hover:bg-white transition-colors border border-transparent hover:border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-medium text-gray-800">{rec.serviceName ?? rec.service?.name ?? 'Dịch vụ'}</div>
                                            <div className="text-xs text-gray-500">• {formatDateTime(rec.scheduledTime)}</div>
                                            <div className="text-xs text-gray-500">• {rec.dentistName ?? rec.dentistUsername ?? (dentists.find(d => d.id === rec.dentistId)?.name) ?? '-'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div>{renderStatusBadge(rec.status)}</div>
                                            <button onClick={() => { setSelectedAppointment(rec); setModalEditing(false); fetchServicesAndDentists(); }} className="px-3 py-1 bg-white border rounded text-sm text-blue-600">Chi tiết</button>
                                            {rec.status === 'PENDING' && (
                                                <button onClick={async () => { const res = await cancelAppointment(rec.id, rec.status); if (res && res.success) { /* nothing extra - list will update */ } }} className="px-3 py-1 bg-red-50 border border-red-200 rounded text-sm">Hủy</button>
                                            )}
                                            {rec.status === 'CONFIRMED' && (
                                                <button onClick={async () => { await openPayment(rec); }}
                                                    className="px-3 py-1 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                                                    <QrCode className="inline-block mr-1" size={14} />
                                                    Thanh toán
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </motion.div>

                    {/* Appointment history full width */}
                    <motion.div className="col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-md p-4 sm:p-6" variants={itemVariants}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700">Lịch Sử Đặt Hẹn</h3>
                                <p className="text-sm text-gray-500">Quản lý và xem chi tiết các lịch hẹn</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input placeholder="Tìm dịch vụ..." value={serviceQuery} onChange={(e) => { setServiceQuery(e.target.value); setCurrentPage(1); }}
                                    className="border rounded-md p-2 text-sm h-10 w-full sm:w-56" />
                                <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                                    className="border rounded-md p-2 text-sm h-10" />
                                <select value={String(statusFilter ?? 'ALL')} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="border rounded-md p-2 text-sm h-10">
                                    <option value="ALL">Tất cả</option>
                                    <option value="PENDING">PENDING</option>
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                                <select value={String(sortBy ?? 'date')} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setSortBy(e.target.value as 'date' | 'dentist' | 'service'); setCurrentPage(1); }} className="border rounded-md p-2 text-sm h-10">
                                    <option value="date">Ngày tạo</option>
                                    <option value="dentist">Bác sĩ</option>
                                    <option value="service">Dịch vụ</option>
                                </select>
                                <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-3 py-1 border rounded text-sm h-10">{sortDir === 'asc' ? '▲' : '▼'}</button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {paginatedAppointments.length === 0 ? (
                                <div className="text-center py-6 text-gray-500">Không có lịch sử đặt hẹn.</div>
                            ) : paginatedAppointments.map((record) => (
                                <motion.div key={record.id} className="bg-gray-50 hover:bg-white transition-colors border border-transparent hover:border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                                    variants={tableRowVariants} whileHover={{ y: -2 }}>
                                    <div className="w-full sm:w-44 flex-shrink-0">
                                        <div className="text-xs text-gray-400">Ngày & giờ</div>
                                        <div className="text-sm font-semibold text-gray-800">{formatDateTime(record.scheduledTime)}</div>
                                        {record.branchName && <div className="text-xs text-gray-500 mt-1">{record.branchName}</div>}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-medium text-gray-700">{record.serviceName ?? record.service?.name ?? (services.find(s => s.id === record.serviceId)?.name) ?? 'Dịch vụ'}</div>
                                                <div className="text-xs text-gray-500">Bác sĩ: {record.dentistName ?? record.dentistUsername ?? (dentists.find(d => d.id === record.dentistId)?.name) ?? 'Chưa có'}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div>{renderStatusBadge(record.status)}</div>
                                                <button onClick={() => { setSelectedAppointment(record); setModalEditing(false); fetchServicesAndDentists(); }} className="px-3 py-1 bg-white border rounded text-sm text-blue-600">Chi tiết</button>

                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600 line-clamp-3" title={String(record.note ?? record.notes ?? '')}>{record.note ?? record.notes ?? ''}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-gray-600">Hiển thị {Math.min(PAGE_SIZE, filteredSortedAppointments.length - (currentPage - 1) * PAGE_SIZE)} / {filteredSortedAppointments.length} kết quả</div>
                            <div className="flex items-center gap-2 justify-end">
                                <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={`px-3 py-1 rounded-md text-sm ${currentPage <= 1 ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}><ChevronLeftIcon className="w-4 h-4" /></button>
                                <div className="px-3 py-1 bg-white border rounded-md text-sm">{currentPage} / {totalPages}</div>
                                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={`px-3 py-1 rounded-md text-sm ${currentPage >= totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white border'}`}><ChevronRightIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Detail modal - mobile-first full screen */}
                {selectedAppointment && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-70" onClick={() => { setSelectedAppointment(null); setModalEditing(false); setAppointmentEditData(null); }} />
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="relative bg-gradient-to-b from-white/60 via-white to-white rounded-xl sm:rounded-2xl shadow-2xl w-full h-[85vh] sm:h-auto sm:max-w-2xl z-10 overflow-auto backdrop-blur-sm">
                            {/* Modern header */}
                            <div className="flex items-start sm:items-center justify-between p-4 sm:px-6 sm:py-4 ">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border bg-white flex items-center justify-center relative shadow-sm">
                                        <Image src={profile.avatarUrl || userMe.avatarUrl || '/images/default-avatar.jpg'} alt="avatar" fill sizes="64px" className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-semibold text-gray-900">{selectedAppointment.serviceName ?? selectedAppointment.service?.name ?? 'Chi tiết lịch hẹn'}</div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {new Date(selectedAppointment.scheduledTime || '').toLocaleDateString()}</span>
                                            <span className="inline-flex items-center gap-1"><Clock size={14} /> {new Date(selectedAppointment.scheduledTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* <div className="hidden sm:block">{renderStatusBadge(selectedAppointment.status)}</div> */}
                                    {/* {!modalEditing && selectedAppointment.status === 'PENDING' && (
                                        <button onClick={() => { setModalEditing(true); setAppointmentEditData({ scheduledTime: isoToLocalInput(selectedAppointment.scheduledTime), notes: selectedAppointment.notes ?? selectedAppointment.note ?? '', serviceId: selectedAppointment.service?.id ?? selectedAppointment.serviceId ?? null, dentistId: selectedAppointment.dentistId ?? null, }); }} title="Chỉnh sửa" className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm hover:scale-[1.02] transition-transform"><Edit2 size={16} /></button>
                                    )} */}
                                    {!modalEditing && (
                                        <button onClick={async () => { const res = await cancelAppointment(selectedAppointment.id, selectedAppointment.status); if (res && res.success) { setSelectedAppointment(null); setModalEditing(false); setAppointmentEditData(null); } }} title="Hủy"
                                            className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm shadow-sm">Hủy</button>
                                    )}

                                    <button onClick={() => { setSelectedAppointment(null); setModalEditing(false); setAppointmentEditData(null); }} title="Đóng" className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 bg-gray-100 border rounded-lg text-sm">Đóng</button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 sm:p-6">
                                {!modalEditing ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                        <div className="sm:col-span-2 space-y-5">
                                            <div className="bg-white rounded-2xl p-5 shadow-sm">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600"><Tag size={16} /></span>
                                                        <div>
                                                            <div className="text-xs text-gray-400">Dịch vụ</div>
                                                            <div className="text-lg font-semibold text-gray-900">{selectedAppointment.serviceName ?? selectedAppointment.service?.name ?? '-'}</div>
                                                            {selectedAppointment.serviceDurationMinutes && (
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    <Clock size={12} className="inline mr-1" />
                                                                    Thời gian: {selectedAppointment.serviceDurationMinutes} phút
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {selectedAppointment.servicePrice && (
                                                            <div className="text-lg font-semibold text-indigo-600">
                                                                {selectedAppointment.servicePrice.toLocaleString('vi-VN')}đ
                                                            </div>
                                                        )}
                                                        {selectedAppointment.serviceDiscountPercent != null && selectedAppointment.serviceDiscountPercent > 0 && (
                                                            <div className="text-xs text-green-600 mt-1">
                                                                Giảm {selectedAppointment.serviceDiscountPercent}%
                                                            </div>
                                                        )}
                                                        {selectedAppointment.serviceTotalPrice && selectedAppointment.serviceTotalPrice !== selectedAppointment.servicePrice && (
                                                            <div className="text-sm font-medium text-gray-900 mt-1">
                                                                Tổng: {selectedAppointment.serviceTotalPrice.toLocaleString('vi-VN')}đ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* {selectedAppointment.note || selectedAppointment.notes ? (
                                                    <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{selectedAppointment.note ?? selectedAppointment.notes}</div>
                                                ) : (
                                                    <div className="mt-4 text-sm text-gray-500">Không có ghi chú.</div>
                                                )} */}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="shadow-sm rounded-2xl p-4 flex items-start gap-3">
                                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-gray-50 text-gray-600"><User size={16} /></span>
                                                    <div>
                                                        <div className="text-xs text-gray-400">Bác sĩ</div>
                                                        <div className="font-medium text-gray-900">{selectedAppointment.dentist?.name ?? selectedAppointment.dentistName ?? selectedAppointment.dentistUsername ?? (dentists.find(d => d.id === selectedAppointment.dentistId)?.name) ?? '-'}</div>
                                                        {selectedAppointment.dentist?.specialization && <div className="text-xs text-gray-500 mt-1">{selectedAppointment.dentist.specialization}</div>}
                                                        {selectedAppointment.dentist?.phone && <div className="text-xs text-gray-500 mt-1">{selectedAppointment.dentist.phone}</div>}
                                                    </div>
                                                </div>
                                                <div className="shadow-sm rounded-2xl p-4 flex items-start gap-3">
                                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-gray-50 text-gray-600"><MapPin size={16} /></span>
                                                    <div>
                                                        <div className="text-xs text-gray-400">Chi nhánh</div>
                                                        <div className="font-medium text-gray-900">{selectedAppointment.branch?.name ?? selectedAppointment.branchName ?? '-'}</div>
                                                        {selectedAppointment.branch?.address && <div className="text-xs text-gray-500 mt-1">{selectedAppointment.branch.address}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-1 space-y-4">
                                            <div className="shadow-sm rounded-2xl p-5 text-center bg-white">
                                                <div className="text-xs text-gray-400">Ngày</div>
                                                <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2"><Calendar size={18} />{new Date(selectedAppointment.scheduledTime || '').toLocaleDateString()}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-2"><Clock size={14} />{new Date(selectedAppointment.scheduledTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>

                                            <div className="shadow-sm rounded-2xl p-4 bg-white">
                                                <div className="text-xs text-gray-400">Trạng thái</div>
                                                <div className="mt-3 flex items-center justify-center">{renderStatusBadge(selectedAppointment.status)}</div>
                                            </div>
                                        </div>



                                        {!modalEditing && selectedAppointment.status === 'CONFIRMED' && (
                                            <button onClick={async () => { await openPayment(selectedAppointment); }} title="Thanh toán"
                                                className="inline-flex cursor-pointer items-center gap-2 px-2 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm shadow-sm">
                                                <QrCode className="inline-block mr-1" size={60} />
                                                <p className="flex flex-col">
                                                    Thanh toán qua
                                                    <span className="font-semibold text-lg text-red-600">VN<span className="text-blue-600">pay</span></span>
                                                </p>

                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <form className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500">Ngày & giờ</label>
                                                <input name="scheduledTime" type="datetime-local" value={appointmentEditData?.scheduledTime || ''} onChange={handleAppointmentFieldChange} className="w-full border rounded p-2 mt-1" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">Dịch vụ</label>
                                                <select name="serviceId" value={appointmentEditData?.serviceId ?? ''} onChange={handleAppointmentFieldChange} className="w-full border rounded p-2 mt-1">
                                                    <option value="">(Chọn)</option>
                                                    {services.map(s => (<option key={s.id} value={s.id}>{s.name} - {s.price}</option>))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-500">Ghi chú</label>
                                            <textarea name="notes" value={appointmentEditData?.notes || ''} onChange={(e) => handleAppointmentFieldChange(e as unknown as React.ChangeEvent<HTMLInputElement>)} className="w-full border rounded p-2 mt-1 h-24" />
                                        </div>

                                        <div className="flex items-center gap-2 justify-end">
                                            <button type="button" onClick={async () => { if (!selectedAppointment) return; const res = await saveAppointmentChanges(selectedAppointment.id); if (res && res.success) { setSelectedAppointment(null); setModalEditing(false); setAppointmentEditData(null); } }} disabled={actionLoading} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded shadow">{actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                                            <button type="button" onClick={() => { setModalEditing(false); setAppointmentEditData(null); }} disabled={actionLoading} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
                {/* Payment modal */}
                {paymentOpen && selectedAppointment && (
                    <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center">
                        <div className="absolute inset-0 bg-black opacity-40" onClick={() => { setPaymentOpen(false); setSelectedPrescription(null); }} />
                        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl z-10 overflow-auto p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <div className="text-lg font-semibold">Thanh toán</div>
                                    <div className="text-sm text-gray-500">{selectedAppointment.serviceName ?? selectedAppointment.service?.name ?? 'Dịch vụ'}</div>
                                </div>
                                <div>
                                    <button onClick={() => { setPaymentOpen(false); setSelectedPrescription(null); }} className="px-3 py-1 bg-gray-100 border rounded">Đóng</button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="border border-gray-300 rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-xs text-gray-400">Khách hàng</div>
                                        <div className="font-medium">{selectedAppointment.customer?.fullName ?? selectedAppointment.customerName ?? userMe.fullName ?? userMe.username ?? '-'}</div>
                                        <div className="text-sm text-gray-500">{selectedAppointment.customer?.email ?? userMe.email ?? '-'}</div>
                                        <div className="text-sm text-gray-500">{selectedAppointment.customer?.phone ?? profile?.phone ?? userMe.phone ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Nha sĩ</div>
                                        <div className="font-medium">{selectedAppointment.dentist?.name ?? selectedAppointment.dentistName ?? selectedAppointment.dentistUsername ?? (dentists.find(d => d.id === selectedAppointment.dentistId)?.name) ?? '-'}</div>
                                        {selectedAppointment.dentist?.specialization && <div className="text-sm text-gray-500">{selectedAppointment.dentist.specialization}</div>}
                                        <div className="text-xs text-gray-400 mt-2">Chi nhánh</div>
                                        <div className="font-medium">{selectedAppointment.branch?.name ?? selectedAppointment.branchName ?? '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Ngày hẹn</div>
                                        <div className="font-medium">{formatDateTime(selectedAppointment.scheduledTime)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400">Mã lịch hẹn</div>
                                        <div className="font-medium">#{selectedAppointment.id}</div>
                                    </div>
                                </div>

                                <div className="border border-gray-300 rounded p-3">
                                    <div className="text-xs text-gray-400">Dịch vụ</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div>
                                            <div className="font-medium">{selectedAppointment.serviceName ?? selectedAppointment.service?.name ?? '-'}</div>
                                            {selectedAppointment.serviceDurationMinutes && (
                                                <div className="text-xs text-gray-500 mt-1">{selectedAppointment.serviceDurationMinutes} phút</div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">{(selectedAppointment.serviceTotalPrice ?? selectedAppointment.servicePrice ?? 0).toLocaleString('vi-VN')}đ</div>
                                            {selectedAppointment.serviceDiscountPercent != null && selectedAppointment.serviceDiscountPercent > 0 && (
                                                <div className="text-xs text-green-600 mt-1">-{selectedAppointment.serviceDiscountPercent}%</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedPrescription ? (
                                    <div className="border border-gray-300 rounded p-3">
                                        <div className="text-xs text-gray-400">Toa thuốc</div>
                                        <div className="mt-2">
                                            <div className="text-sm font-medium">Bệnh nhân: {selectedPrescription.patientName}</div>
                                            <div className="text-sm text-gray-600">Tổng: {selectedPrescription.totalAmount ?? 0}đ • Thành tiền: {selectedPrescription.finalAmount ?? selectedPrescription.totalAmount ?? 0}đ</div>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="text-left text-xs text-gray-500">
                                                        <tr>
                                                            <th className="pr-4">Thuốc</th>
                                                            <th className="pr-4">Số lượng</th>
                                                            <th className="pr-4">Ghi chú</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(selectedPrescription.drugs || []).map(d => (
                                                            <tr key={d.id} className="border-t">
                                                                <td className="py-2">{d.drugName ?? d.drugId}</td>
                                                                <td className="py-2">{d.quantity}</td>
                                                                <td className="py-2">{d.note ?? '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="border border-gray-300 rounded p-3">
                                    <div className="text-xs text-gray-400">Tóm tắt thanh toán</div>
                                    <div className="mt-2 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <div className="text-gray-600">Giá dịch vụ gốc</div>
                                            <div className="text-right">{(selectedAppointment.servicePrice ?? 0).toLocaleString('vi-VN')}đ</div>
                                        </div>
                                        {selectedAppointment.serviceDiscountPercent != null && selectedAppointment.serviceDiscountPercent > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <div>Giảm giá dịch vụ ({selectedAppointment.serviceDiscountPercent}%)</div>
                                                <div className="text-right">-{((selectedAppointment.servicePrice ?? 0) * (selectedAppointment.serviceDiscountPercent / 100)).toLocaleString('vi-VN')}đ</div>
                                            </div>
                                        )}
                                        {selectedAppointment.serviceTotalPrice && selectedAppointment.serviceTotalPrice !== selectedAppointment.servicePrice && (
                                            <div className="flex justify-between font-medium">
                                                <div className="text-gray-700">Tổng dịch vụ</div>
                                                <div className="text-right">{selectedAppointment.serviceTotalPrice.toLocaleString('vi-VN')}đ</div>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <div className="text-gray-600">Tổng thuốc</div>
                                            <div className="text-right">{selectedPrescription ? (selectedPrescription.totalAmount ?? 0).toLocaleString('vi-VN') + 'đ' : '0đ'}</div>
                                        </div>
                                        {selectedPrescription && (selectedPrescription.discountAmount || selectedPrescription.discountPercent) && (
                                            <div className="flex justify-between text-green-600">
                                                <div>Giảm giá thuốc{selectedPrescription.discountPercent ? ` (${selectedPrescription.discountPercent}%)` : ''}</div>
                                                <div className="text-right">-{(selectedPrescription.discountAmount ?? 0).toLocaleString('vi-VN')}đ</div>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 flex justify-between font-semibold text-base">
                                            <div className="text-gray-800">Tổng cần thanh toán</div>
                                            <div className="text-right text-indigo-600">{(payAmount ?? 0).toLocaleString('vi-VN')}đ</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setPaymentOpen(false); setSelectedPrescription(null); }} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                                    <button onClick={async () => { await handleCreateVnPay(); }} disabled={payLoading} className="px-4 py-2 bg-indigo-600 text-white rounded">{payLoading ? 'Đang tạo...' : 'Thanh toán'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur bg-opacity-50">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Đổi mật khẩu</h2>
                            <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }} className="text-gray-400 hover:text-gray-600">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500">Email / Tên đăng nhập</label>
                                <input value={userMe?.email || userMe?.username || ''} readOnly className="w-full mt-1 p-2 border rounded-md text-sm bg-gray-100 text-gray-600" />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Mật khẩu mới</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }} className="w-full mt-1 p-2 pr-10 border rounded-md text-sm" placeholder="Tối thiểu 8 ký tự" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label="Hiện/ẩn mật khẩu">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Nhập lại mật khẩu</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }} className="w-full mt-1 p-2 pr-10 border rounded-md text-sm" placeholder="Nhập lại để xác nhận" />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" aria-label="Hiện/ẩn mật khẩu">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {passwordError && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{passwordError}</p>}

                            <p className="text-[11px] text-gray-500">Mật khẩu phải từ 8 ký tự, bắt đầu bằng chữ in hoa, có ít nhất 1 số và 1 ký tự đặc biệt.</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); }} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Hủy</button>
                            <button onClick={handleLazyResetPassword} disabled={passwordLoading} className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold text-white ${passwordLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
