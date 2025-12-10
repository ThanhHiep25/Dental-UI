"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const FixedRemovablePricing: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

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
        <div>
            <section className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800">{t("prosthetics_title")}</h1>
                    <p className="mt-6 text-lg text-gray-700 max-w-3xl">{t("prosthetics_intro")}</p>
                </div>
            </section>

            <section className="bg-[#6f65c8] py-10">
                <div className="max-w-7xl mx-auto px-6 text-white">
                    {/* General price box (consultation) */}
                    <div className="max-w-5xl mx-auto mb-8">
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <div className="grid grid-cols-2 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="text-lg">{t("type_of_service")}</div>
                                <div className="text-lg">{t("price_of_service")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-2 items-center px-6 py-6 text-gray-700">
                                    <div className="text-lg">{t("dental_exam")}</div>
                                    <div className="text-lg text-center">{t("free")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fixed Prosthetics */}
                    <div className="max-w-6xl mx-auto my-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("prosthetics_fixed_title")}</h2>

                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <div className="grid grid-cols-3 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("type_of_service")}</div>
                                <div className="px-6 py-4 text-lg">{t("price_of_service")}</div>
                                <div className="px-6 py-4 text-lg">{t("warranty")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                    <div className="text-lg">{t("prosthetics_fixed_row1_service")}</div>
                                    <div className="text-lg text-center">{t("prosthetics_fixed_row1_price")}</div>
                                    <div className="text-lg text-center">{t("prosthetics_fixed_row1_warranty")}</div>
                                </div>
                                <div className="grid grid-cols-3 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div className="text-lg">{t("prosthetics_fixed_row2_service")}</div>
                                    <div className="text-lg text-center">{t("prosthetics_fixed_row2_price")}</div>
                                    <div className="text-lg text-center">{t("prosthetics_fixed_row2_warranty")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Removable Prosthetics */}
                    <div className="max-w-6xl mx-auto my-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("prosthetics_removable_title")}</h2>

                        {/* Framework */}
                        <div className="mb-8">
                            <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("prosthetics_framework_title")}</h3>
                            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                <div className="grid grid-cols-3 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                    <div className="px-6 py-4 text-lg">{t("type_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("price_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("warranty")}</div>
                                </div>

                                <div className="bg-white">
                                    <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                        <div>{t("prosthetics_framework_row1_service")}</div>
                                        <div className="text-center">{t("prosthetics_framework_row1_price")}</div>
                                        <div className="text-center">{t("prosthetics_framework_row1_warranty")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                        <div>{t("prosthetics_framework_row2_service")}</div>
                                        <div className="text-center">{t("prosthetics_framework_row2_price")}</div>
                                        <div className="text-center">{t("prosthetics_framework_row2_warranty")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Partial Acrylic */}
                        <div className="mb-8">
                            <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("prosthetics_partial_title")}</h3>
                            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                <div className="grid grid-cols-3 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                    <div className="px-6 py-4 text-lg">{t("type_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("price_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("warranty")}</div>
                                </div>

                                <div className="bg-white">
                                    <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                        <div>{t("prosthetics_partial_row1_service")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row1_price")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row1_warranty")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                        <div>{t("prosthetics_partial_row2_service")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row2_price")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row2_warranty")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                        <div>{t("prosthetics_partial_row3_service")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row3_price")}</div>
                                        <div className="text-center">{t("prosthetics_partial_row3_warranty")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Denture */}
                        <div>
                            <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("prosthetics_full_title")}</h3>
                            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                <div className="grid grid-cols-3 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                    <div className="px-6 py-4 text-lg">{t("type_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("price_of_service")}</div>
                                    <div className="px-6 py-4 text-lg">{t("warranty")}</div>
                                </div>

                                <div className="bg-white">
                                    <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                        <div>{t("prosthetics_full_row1_service")}</div>
                                        <div className="text-center">{t("prosthetics_full_row1_price")}</div>
                                        <div className="text-center">{t("prosthetics_full_row1_warranty")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                        <div>{t("prosthetics_full_row2_service")}</div>
                                        <div className="text-center">{t("prosthetics_full_row2_price")}</div>
                                        <div className="text-center">{t("prosthetics_full_row2_warranty")}</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-6 py-6 text-gray-700">
                                        <div>{t("prosthetics_full_row3_service")}</div>
                                        <div className="text-center">{t("prosthetics_full_row3_price")}</div>
                                        <div className="text-center">{t("prosthetics_full_row3_warranty")}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default FixedRemovablePricing;
