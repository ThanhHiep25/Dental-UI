'use client';

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    hours: { day: string; time: string }[];
    mapUrl: string;
    latitude: number;
    longitude: number;
}

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [expandedBranch, setExpandedBranch] = useState<string>("main");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const branches: Branch[] = [
        {
            id: "main",
            name: t('Dental Center') || "Trung tâm Nha khoa chính",
            address: "123 Main St, Ho Chi Minh City, Vietnam",
            phone: "(123) 456-7890",
            email: "1M9dH@example.com",
            hours: [
                { day: "Thứ 2 - Thứ 6", time: "8:00 AM - 6:30 PM" },
                { day: "Thứ 7", time: "8:00 AM - 5:00 PM" },
                { day: "Chủ Nhật", time: "Đóng cửa" },
                { day: "Lễ Tết", time: "Đóng cửa" },
            ],
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37153.69102316396!2d106.70712590217592!3d10.772176241829946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317525f61562e3c9%3A0xa744f70e7cf9ff0f!2sSala%20Urban%20Park!5e1!3m2!1sen!2sus!4v1758379684893!5m2!1sen!2sus",
            latitude: 10.772176,
            longitude: 106.707126,
        },
        {
            id: "branch1",
            name: t('Chi nhánh 1') || "Chi nhánh 1",
            address: "456 Branch St, District 1, Ho Chi Minh City",
            phone: "(123) 456-7891",
            email: "branch1@example.com",
            hours: [
                { day: "Thứ 2 - Thứ 6", time: "8:00 AM - 6:30 PM" },
                { day: "Thứ 7", time: "8:00 AM - 5:00 PM" },
                { day: "Chủ Nhật", time: "Đóng cửa" },
            ],
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.493762255889!2d106.66271561477157!3d10.776706362093707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4bd0e22451%3A0x79eb07ff7f04797a!2sDistrict%201%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2sus!4v1758379684893!5m2!1sen!2sus",
            latitude: 10.776706,
            longitude: 106.662716,
        },
        {
            id: "branch2",
            name: t('Chi nhánh 2') || "Chi nhánh 2",
            address: "789 Second Branch Ave, District 3, Ho Chi Minh City",
            phone: "(123) 456-7892",
            email: "branch2@example.com",
            hours: [
                { day: "Thứ 2 - Thứ 6", time: "8:00 AM - 6:30 PM" },
                { day: "Thứ 7", time: "8:00 AM - 5:00 PM" },
                { day: "Chủ Nhật", time: "10:00 AM - 4:00 PM" },
            ],
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.493762255889!2d106.68177411477157!3d10.784806362093707!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4bd0e22451%3A0x79eb07ff7f04797a!2sDistrict%203%2C%20Ho%20Chi%20Minh%20City!5e0!3m2!1sen!2sus!4v1758379684893!5m2!1sen!2sus",
            latitude: 10.784806,
            longitude: 106.681774,
        },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus("loading");
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitStatus("success");
            setFormData({ name: "", email: "", phone: "", message: "" });
            setTimeout(() => setSubmitStatus("idle"), 3000);
        } catch (error) {
            setSubmitStatus("error");
            setTimeout(() => setSubmitStatus("idle"), 3000);
        }
    };

    if (loading) {
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

return (
    <div className="w-full bg-gradient-to-b from-white via-purple-50/30 to-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-16 md:py-24 px-4">
            <motion.div
                className="max-w-6xl mx-auto text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex justify-center mb-6">
                    <Image
                        src="/LOGO/tooth.png"
                        alt="Nha khoa Logo"
                        width={100}
                        height={100}
                        priority
                        className="drop-shadow-lg"
                    />
                </div>
                <h1 className="text-5xl md:text-6xl roboto-900 mb-4 leading-tight font-bold">
                    {t('name_dental') || "Nha Khoa Chuyên Nghiệp"}
                </h1>
                <p className="text-xl md:text-2xl text-purple-100 roboto-600 mb-6">
                    Liên hệ với chúng tôi - Chăm sóc sức khỏe răng miệng của bạn
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="tel:0123456789" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-100 transition duration-300">
                        <Phone size={20} />
                        Gọi ngay: 0123456789
                    </a>
                    <a href="mailto:1M9dH@example.com" className="inline-flex items-center gap-2 bg-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition duration-300">
                        <Mail size={20} />
                        Email ngay
                    </a>
                </div>
            </motion.div>
        </section>

        {/* Contact Info Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
            <motion.h2
                className="text-4xl roboto-900 font-bold text-center mb-12 text-gray-800"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                Các Chi Nhánh Của Chúng Tôi
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {branches.map((branch, idx) => (
                    <motion.div
                        key={branch.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-purple-100"
                    >
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1"></div>
                        <div className="p-6">
                            <h3 className="text-xl roboto-900 font-bold text-gray-800 mb-4">{branch.name}</h3>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3 text-gray-700">
                                    <MapPin size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                                    <p className="text-sm">{branch.address}</p>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone size={20} className="text-purple-600 flex-shrink-0" />
                                    <a href={`tel:${branch.phone}`} className="text-sm font-semibold hover:text-purple-600 transition">
                                        {branch.phone}
                                    </a>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={20} className="text-purple-600 flex-shrink-0" />
                                    <a href={`mailto:${branch.email}`} className="text-sm hover:text-purple-600 transition">
                                        {branch.email}
                                    </a>
                                </div>
                            </div>

                            <button
                                onClick={() => setExpandedBranch(expandedBranch === branch.id ? "" : branch.id)}
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg roboto-700 hover:shadow-lg transition"
                            >
                                {expandedBranch === branch.id ? "Ẩn chi tiết" : "Xem chi tiết"}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Expanded Branch Details */}
            {expandedBranch && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-xl shadow-2xl overflow-hidden border-2 border-purple-200 mb-12"
                >
                    <div className="p-8">
                        <h3 className="text-3xl roboto-900 font-bold text-gray-800 mb-8">
                            {branches.find(b => b.id === expandedBranch)?.name}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Map */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="rounded-lg overflow-hidden shadow-lg"
                            >
                                <iframe
                                    src={branches.find(b => b.id === expandedBranch)?.mapUrl}
                                    className="w-full h-96"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`Map - ${branches.find(b => b.id === expandedBranch)?.name}`}
                                ></iframe>
                            </motion.div>

                            {/* Hours & Details */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h4 className="text-xl roboto-900 font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Clock size={24} className="text-purple-600" />
                                        Giờ hoạt động
                                    </h4>
                                    <div className="space-y-2 bg-purple-50 p-4 rounded-lg">
                                        {branches.find(b => b.id === expandedBranch)?.hours.map((hour, idx) => (
                                            <div key={idx} className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-700">{hour.day}:</span>
                                                <span className="text-purple-600 font-bold roboto-700">{hour.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-3">📞 <strong>Hotline:</strong></p>
                                    <a href={`tel:${branches.find(b => b.id === expandedBranch)?.phone}`} className="text-lg roboto-900 text-purple-600 hover:text-purple-800 transition">
                                        {branches.find(b => b.id === expandedBranch)?.phone}
                                    </a>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
                                    <p className="text-gray-700 mb-3">📧 <strong>Email:</strong></p>
                                    <a href={`mailto:${branches.find(b => b.id === expandedBranch)?.email}`} className="text-lg roboto-900 text-purple-600 hover:text-purple-800 transition">
                                        {branches.find(b => b.id === expandedBranch)?.email}
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </section>

        {/* Contact Form Section */}
        <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-16 px-4">
            <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl roboto-900 text-white text-center mb-3">Liên Hệ Với Chúng Tôi</h2>
                <p className="text-purple-100 text-center mb-8">Để lại lời nhắn và chúng tôi sẽ liên hệ lại trong thời gian soonest</p>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-700 roboto-700 mb-2">Họ và Tên</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Nhập họ và tên của bạn"
                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 roboto-700 mb-2">Số Điện Thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                placeholder="0123456789"
                                className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 roboto-700 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="email@example.com"
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 roboto-700 mb-2">Lời Nhắn</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            placeholder="Nhập lời nhắn của bạn..."
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-600 transition resize-none"
                        ></textarea>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={submitStatus === "loading"}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg roboto-900 text-lg hover:shadow-lg transition disabled:opacity-70"
                    >
                        {submitStatus === "loading" && <span>Đang gửi...</span>}
                        {submitStatus === "success" && <span>✓ Gửi thành công!</span>}
                        {submitStatus === "error" && <span>✗ Lỗi! Vui lòng thử lại</span>}
                        {submitStatus === "idle" && (
                            <span className="flex items-center justify-center gap-2">
                                <Send size={20} />
                                Gửi Thông Tin
                            </span>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </section>

        {/* FAQ/Additional Info Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
            <motion.h2
                className="text-4xl roboto-900 text-center mb-12 text-gray-800"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                Các Câu Hỏi Thường Gặp
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { q: "Giờ hoạt động là mấy giờ?", a: "Chúng tôi mở cửa từ 8:00 AM đến 6:30 PM từ Thứ 2 đến Thứ 6, và 8:00 AM đến 5:00 PM vào Thứ 7." },
                    { q: "Làm cách nào để đặt lịch hẹn?", a: "Bạn có thể gọi trực tiếp cho chúng tôi hoặc sử dụng mẫu liên hệ trên trang web." },
                    { q: "Các dịch vụ nào bạn cung cấp?", a: "Chúng tôi cung cấp nhiều dịch vụ nha khoa từ khám tổng quát đến các điều trị chuyên sâu." },
                    { q: "Chi phí khám như thế nào?", a: "Vui lòng liên hệ với các chi nhánh để được tư vấn chi phí chi tiết." },
                ].map((faq, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg border-l-4 border-purple-600"
                    >
                        <h4 className="text-lg roboto-900 text-gray-800 mb-2">{faq.q}</h4>
                        <p className="text-gray-700">{faq.a}</p>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Quick Stats Section */}
        <section className="bg-gradient-to-r from-purple-100 to-blue-100 py-16 px-4">
            <motion.div
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    {[
                        { number: "15+", label: "Năm kinh nghiệm" },
                        { number: "50K+", label: "Bệnh nhân hài lòng" },
                        { number: "3", label: "Chi nhánh" },
                        { number: "24/7", label: "Hỗ trợ khách hàng" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-lg p-6 shadow-md"
                        >
                            <p className="text-4xl roboto-900 text-purple-600 mb-2">{stat.number}</p>
                            <p className="text-gray-700 roboto-700">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-700 to-blue-700 text-white py-16 px-4">
            <motion.div
                className="max-w-4xl mx-auto text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
            >
                <h2 className="text-4xl roboto-900 mb-4">Sẵn Sàng Để Nụ Cười Của Bạn Rạng Rỡ?</h2>
                <p className="text-xl text-purple-100 mb-8">Hãy liên hệ với chúng tôi ngay hôm nay để đặt lịch hẹn hoặc tìm hiểu thêm về dịch vụ của chúng tôi</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a href="tel:0123456789" className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition duration-300">
                        <Phone size={20} />
                        Gọi ngay
                    </a>
                    <a href="#contact-form" className="inline-flex items-center gap-2 bg-transparent text-white border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition duration-300">
                        <Mail size={20} />
                        Gửi lời nhắn
                    </a>
                </div>
            </motion.div>
        </section>
    </div>
);
};

export default ContactPage;