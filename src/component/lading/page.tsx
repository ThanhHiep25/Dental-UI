'use client'
import { motion } from 'framer-motion';
import UpcomingEvents from './Upcoming';
import { CalendarClockIcon, GroupIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AppointmentModal from '../model/Appointment';

const LadingPage: React.FC = () => {
    const { t } = useTranslation();
    const [isopenModelAppoint, setIsOpenModelAppoint] = useState(false);

    // Hàm để mở modal
    const handleOpenModal = () => {
        setIsOpenModelAppoint(true);
    };

    // Hàm để đóng modal
    const handleCloseModal = () => {
        setIsOpenModelAppoint(false);
    };

    // Mảng chứa các đường dẫn ảnh cho slideshow
    const images = [
        { id: 1, src: '/IMGLADING/1_n.jpg', alt: 'Image 1' },
        { id: 2, src: '/IMGLADING/2_n.jpg', alt: 'Image 2' },
        { id: 3, src: '/IMGLADING/3_n.jpg', alt: 'Image 3' },
        { id: 4, src: '/IMGLADING/4_n.jpg', alt: 'Image 4' },
        { id: 5, src: '/IMGLADING/5_n.jpg', alt: 'Image 5' },
        { id: 6, src: '/IMGLADING/6_n.jpg', alt: 'Image 6' }
    ];

    const imagesPanter = [
        { id: 1, src: '/DTImplant/ANKYLOS-LOGO.png', alt: 'Image 1' },
        { id: 2, src: '/DTImplant/Chaorum-1024x428.png', alt: 'Image 2' },
        { id: 3, src: '/DTImplant/dentis-0f23fa.png', alt: 'Image 3' },
        { id: 4, src: '/DTImplant/IBS.png', alt: 'Image 4' },
        { id: 5, src: '/DTImplant/logo-cuoi.png', alt: 'Image 5' },
        { id: 7, src: '/DTImplant/logo-dio.png', alt: 'Image 7' },
        { id: 8, src: '/DTImplant/nobel-biocare-logo-1024x457.webp', alt: 'Image 8' },
        { id: 9, src: '/DTImplant/paltop-1024x175.webp', alt: 'Image 9' },
        { id: 10, src: '/DTImplant/Ritter_Implants_Logo_NEW-min-min.png', alt: 'Image 10' },
        { id: 11, src: '/DTImplant/Straumann-logo.png', alt: 'Image 11' },
        { id: 12, src: '/DTImplant/tekka.png', alt: 'Image 12' },
    ]

    return (
        <div className="mt-[-80px] relative">
            {/* --- Phần giới thiệu chính (Logo & Tiêu đề) --- */}
            <section className="relative w-full h-screen bg-gradient-to-bl from-purple-600 via-slate-900/20 to-purple-700">
                <motion.video
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    src="/LOGO/hoangbinhdental.mp4" autoPlay loop muted
                    className="w-full h-full object-cover" />

                <div className="absolute bottom-0 left-0 w-full h-90 bg-gradient-to-t from-purple-900 to-transparent opacity-50"></div>

                <div className="absolute bottom-20 left-0 w-full md:px-10 px-5 ">
                    <div className="text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: -50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-xl md:text-6xl font-bold text-white mb-4"
                        >
                            {t('page_title')}
                        </motion.h1>

                        <div className="flex md:gap-4 gap-2 items-center ">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleOpenModal} // Sử dụng hàm mới để mở modal
                                className="flex md:text-2xl text-xl items-center justify-center md:gap-2 gap-1 border-2 bg-white/90 backdrop-blur-md text-purple-600 hover:text-white border-purple-600 hover:border-blue-700 hover:bg-blue-700 font-semibold py-3 px-4 rounded-2xl">
                                <CalendarClockIcon className="w-6 h-6 mr-2" />
                                {t('book_appointment')}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                className="flex md:text-2xl text-xl items-center justify-center md:gap-2 gap-1 border-2 bg-gray-400/20 backdrop-blur-md border-purple-600 hover:border-blue-700 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-2xl">
                                {t('smile_gallery')}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Phần giới thiệu --- */}
            <section className="my-20 bg-white w-full flex md:flex-row px-10 flex-col items-center justify-center">
                <div className="py-20 px-4 w-full md:w-2/3 flex flex-col justify-center gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <h2 className="text-6xl roboto-900 mb-6 bg-gradient-to-br from-purple-600 to-yellow-500 bg-clip-text text-transparent">
                            {t('about_us_title')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed md:text-xl text-lg mb-4">
                            {t('about_us_paragraph_1')}
                        </p>
                        <p className="text-gray-700 leading-relaxed md:text-xl text-lg mb-4">
                            {t('about_us_paragraph_2')}
                        </p>
                        <p className="text-gray-700 leading-relaxed md:text-xl text-lg mb-4">
                            {t('about_us_paragraph_3')}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleOpenModal} // Sử dụng hàm mới để mở modal
                            className="flex items-center md:w-auto w-full justify-center md:gap-2 gap-1 bg-purple-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
                            <CalendarClockIcon size={30} /> {t('book_consultation_now')}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center mt-3 w-full md:w-auto justify-center md:gap-2 gap-1 bg-yellow-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-6 rounded-full transition-colors duration-300">
                            <GroupIcon size={30} /> {t('experience_services')}
                        </motion.button>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex justify-center items-center gap-4"
                    >
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            src="/CHUNGNHAN/ISO.png"
                            alt="Logo"
                            className='md:w-32 md:h-32 w-20 h-20 object-cover'
                        />
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            src="/CHUNGNHAN/GCR.png"
                            alt="Logo"
                            className='md:w-32 md:h-32 w-20 h-20 object-cover'
                        />
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            src="/CHUNGNHAN/WhatClinic.png"
                            alt="Logo"
                            className='md:w-32 md:h-32 w-20 h-20 object-cover'
                        />
                        <motion.img
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            src="/CHUNGNHAN/Google-Reviews-Source.svg"
                            alt="Logo"
                            className='md:w-32 md:h-32 w-20 h-20 object-cover'
                        />
                    </motion.div>
                </div>
                <div className="flex flex-wrap justify-center md:w-1/2 w-full gap-4 my-6">
                    {images.map((image) => (
                        <motion.img
                            key={image.id}
                            src={image.src}
                            alt={image.alt}
                            className="w-full md:w-[40%] h-70 border-4 border-yellow-400 shadow-2xl rounded-xl rounded-tl-4xl rounded-br-4xl object-cover"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        />
                    ))}
                </div>
            </section>

            {/* Phần sự kiện sắp tới (đã có từ trước) */}
            <UpcomingEvents />

            {/* --- Phần thông tin chung về đối tác--- */}
            <section className="py-20 bg-purple-100 text-white  flex items-center justify-center">
                <div className="container mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="md:text-3xl text-2xl text-yellow-500 font-bold text-center mb-6"
                    >
                        {t('about_panters_implants')}
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid md:grid-cols-6 gap-8 my-10"
                    >
                        {
                            imagesPanter.map((image) => (
                                <motion.img
                                    key={image.id}
                                    src={image.src}
                                    alt={image.alt}
                                    className="w-40 h-20 object-fill"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: image.id * 0.1, delay: image.id * 0.1 }}
                                />
                            ))
                        }
                    </motion.div>


                </div>
            </section>

            {/* Tích hợp component AppointmentModal */}
            <AppointmentModal
                isOpen={isopenModelAppoint}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default LadingPage;