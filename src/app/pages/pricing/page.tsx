'use client';

import { useTranslation } from "react-i18next";
import { motion } from 'framer-motion'
import { useEffect, useState } from "react";


const Pricing: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, [])


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
        <div className="">

            <section className="bg-white px-12 py-12 flex md:flex-row flex-col items-center">
                <motion.img
                    src="/IMGPrice/img_title_kh.jpg"
                    alt="Pricing"
                    className="w-[50%] h-auto object-cover"
                />

                <div className=" 
                bg-purple-50 flex flex-col items-center
                 justify-center md:ml-1 mt-8 md:mt-0 p-6 
                border-b-2 border-purple-500 rounded-lg shadow-lg">
                    <div className="text-start mb-12">
                        <h2 className="text-3xl font-extrabold text-purple-900">{t("Title_Price")}</h2>
                        <p className="mt-4 text-justify text-lg text-gray-600">{t("Title_Content_Price")}</p>
                    </div>
                </div>
            </section>


            <section className="bg-[#6f65c8]">
                <div className="max-w-7xl mx-auto  py-12 text-center text-white">
                    <h1 className="md:text-5xl text-2xl font-bold">{t("table_price")}</h1>

                    <div className="w-full mt-20 flex flex-col items-center justify-center">
                        <div className="w-full max-w-3xl">
                            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                {/* Purple header */}
                                <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                    <div className="px-6 py-4 text-xl border-r border-white/30">{t("type_of_service")}</div>
                                    <div className="px-6 py-4 text-xl">{t("price_of_service")}</div>
                                </div>

                                {/* Body rows */}
                                <div className="bg-white">
                                    <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg font-bold">{t("dental_exam")}</div>
                                        <div className="text-lg font-bold text-center">{t("free")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start mt-20 max-w-7xl">
                            <p className="mt-4 text-justify text-xl text-white">{t("des_dental_exam1")}</p>
                        </div>
                        <div className="w-full">
                            <h3 className="mt-20 text-start text-2xl font-bold
                             text-yellow-200/80">{t("title_teeth_cleaning")}</h3>
                            <div className="w-full max-w-3xl mx-auto mt-20">
                                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    {/* Purple header */}
                                    <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                        <div className="px-6 py-4 text-xl border-r border-white/30">{t("type_of_service")}</div>
                                        <div className="px-6 py-4 text-xl">{t("price_of_service")}</div>
                                    </div>

                                    {/* Body rows */}
                                    <div className="bg-white">
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("teeth_cleaning")}</div>
                                            <div className="text-lg font-bold text-center">{t("teeth_cleaning_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("teeth_cleaning")}</div>
                                            <div className="text-lg font-bold text-center">{t("teeth_cleaning_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("teeth_cleaning_premium")}</div>
                                            <div className="text-lg font-bold text-center">{t("teeth_cleaning_premium_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("teeth_cleaning_under")}</div>
                                            <div className="text-lg font-bold text-center">{t("teeth_cleaning_under_price")}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start mt-20 max-w-7xl">
                            <p className="mt-4 text-justify text-xl text-white">{t("des_teeth_cleaning1")}</p>
                        </div>

                        {/* Trám răng */}
                        <div className="w-full">
                            <h3 className="mt-20 text-start text-2xl font-bold text-yellow-200/80">{t("title_filling")}</h3>
                            <div className="w-full max-w-3xl mx-auto mt-20">
                                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                        <div className="px-6 py-4 text-xl border-r border-white/30">{t("type_of_service")}</div>
                                        <div className="px-6 py-4 text-xl">{t("price_of_service")}</div>
                                    </div>

                                    <div className="bg-white">
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("filling_simple")}</div>
                                            <div className="text-lg font-bold text-center">{t("filling_simple_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                            <div className="text-lg font-bold">{t("filling_complex")}</div>
                                            <div className="text-lg font-bold text-center">{t("filling_complex_price")}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start mt-8 max-w-7xl">
                            <p className="mt-4 text-justify text-xl text-white">{t("des_filling")}</p>
                        </div>


                        {/* Điều trị tủy */}
                        <div className="w-full">
                            <h3 className="mt-20 text-start text-2xl font-bold text-yellow-200/80">{t("title_endodontic")}</h3>
                            <div className="w-full max-w-3xl mx-auto mt-20">
                                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                        <div className="px-6 py-4 text-xl border-r border-white/30">{t("type_of_service")}</div>
                                        <div className="px-6 py-4 text-xl">{t("price_of_service")}</div>
                                    </div>

                                    <div className="bg-white">
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("endodontic_1")}</div>
                                            <div className="text-lg font-bold text-center">{t("endodontic_1_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                            <div className="text-lg font-bold">{t("endodontic_2")}</div>
                                            <div className="text-lg font-bold text-center">{t("endodontic_2_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("endodontic_complex")}</div>
                                            <div className="text-lg font-bold text-center">{t("endodontic_complex_price")}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start mt-8 max-w-7xl">
                            <p className="mt-4 text-justify text-xl text-white">{t("des_endodontic")}</p>
                        </div>


                        {/* Nhổ răng */}
                        <div className="w-full">
                            <h3 className="mt-20 text-start text-2xl font-bold text-yellow-200/80">{t("title_extraction")}</h3>
                            <div className="w-full max-w-3xl mx-auto mt-20">
                                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                    <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                        <div className="px-6 py-4 text-xl border-r border-white/30">{t("type_of_service")}</div>
                                        <div className="px-6 py-4 text-xl">{t("price_of_service")}</div>
                                    </div>

                                    <div className="bg-white">
                                        <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                                            <div className="text-lg font-bold">{t("extraction_multi_root")}</div>
                                            <div className="text-lg font-bold text-center">{t("extraction_multi_root_price")}</div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                            <div className="text-lg font-bold">{t("extraction_loose")}</div>
                                            <div className="text-lg font-bold text-center">{t("extraction_loose_price")}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start mt-8 max-w-7xl">
                            <p className="mt-4 text-justify text-xl text-white">{t("des_extraction")}</p>
                        </div>

                        <div className="w-full text-white mt-40">
                            <p className="mt-4 text-center text-2xl text-white">{t("bottom_title")}</p>
                        </div>
                    </div>

                </div>

            </section>
        </div>
    )
}
export default Pricing;
