
'use client';

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";

const ContactPage: React.FC = () => {

    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            <motion.img
                src="/cardio-unscreen.gif"
                alt="Loading..."
                transition={{ duration: 1, repeat: Infinity }}
                className="w-32 h-32"
            />
        </div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center justify-center">
            <div className="flex flex-row items-center justify-center gap-4">
                <Image src="/LOGO/tooth.png" alt="Logo" width={80} height={80} />
                <h1 className="text-4xl text-purple-800 roboto-900 ">{t('name_dental')}</h1>
            </div>


            <details open className="w-full bg-purple-600/20 border border-gray-300 rounded-lg p-6 shadow-md mt-10">
                <summary className="cursor-pointer text-2xl  roboto-700 ">{t('Dental Center')}</summary>
                <div className="mt-4 space-y-2 text-lg text-gray-600">
                    <p><strong>{t('Address')}:</strong> 123 Main St, City, Country</p>
                    <p><strong>{t('Phone')}:</strong> (123) 456-7890</p>
                    <p><strong>{t('Email')}:</strong> 1M9dH@example.com</p>
                </div>

                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37153.69102316396!2d106.70712590217592!3d10.772176241829946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317525f61562e3c9%3A0xa744f70e7cf9ff0f!2sSala%20Urban%20Park!5e1!3m2!1sen!2sus!4v1758379684893!5m2!1sen!2sus"
                    className="w-full h-96 mt-4 rounded-xl shadow-md"></iframe>

                <hr className="my-4 border-t-2 border-gray-200 w-full" />

                <div className="w-full p-3 text-gray-600">
                    <h3 className="text-xl  roboto-700">Giờ mở cửa</h3>

                    <div className="grid grid-cols-2 gap-4 mt-5 ">
                        <div className="flex flex-col">
                            <p className="font-bold">Thu 2 - Thu 6</p>
                            <p>8:00 AM - 6h30 PM</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold">Thu 7</p>
                            <p>8:00 AM - 5:00 PM</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold">Chủ Nhật</p>
                            <p>Đóng cửa</p>
                        </div>
                        <div className="flex flex-col">
                            <p className="font-bold">Lễ Tết</p>
                            <p>Đóng cửa</p>
                        </div>
                    </div>
                </div>

                <hr className="my-4 border-t-2 border-gray-200 w-full" />

                <div className="w-full p-3 text-gray-600">
                    <h3 className="text-xl  roboto-700">Liên hệ hỗ trợ / Hotline</h3>
                    <p className=" roboto-900 mt-2 ">Hotline: 0123456789</p>

                    <h3 className="text-xl  roboto-700 mt-4">Email</h3>
                    <p className=" roboto-900 mt-2 ">1M9dH@example.com</p>
                </div>
            </details>

            <details className="w-full bg-purple-600/20 border border-gray-300 rounded-lg p-6 shadow-md mt-10">
                <summary className="cursor-pointer text-2xl text-gray-600 roboto-700 ">{t('Chi nhánh 1')}</summary>
            </details>

            <details className="w-full bg-purple-600/20 border border-gray-300 rounded-lg p-6 shadow-md mt-10">
                <summary className="cursor-pointer text-2xl text-gray-600 roboto-700 ">{t('Chi nhánh 2')}</summary>
            </details>


        </div>
    )
}

export default ContactPage;