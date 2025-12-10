"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ImplantSurgeryPricing: React.FC = () => {
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
        <div>
            <section className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800">{t("implant_title")}</h1>
                </div>
            </section>

            <section className="bg-[#6f65c8] py-10">
                <div className="max-w-7xl mx-auto px-6 text-white">
                    {/* Abutment box */}
                    <div className="max-w-5xl mx-auto mb-8">
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <div className="grid grid-cols-2 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="text-lg">{t("implant_abutment_title")}</div>
                                <div className="text-lg">{t("implant_col_listed_price")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-2 items-center px-6 py-6 text-gray-700">
                                    <div className="text-lg">{t("implant_abutment_row_consultation")}</div>
                                    <div className="text-lg text-center">{t("implant_abutment_row_consultation_price")}</div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-6 text-white text-lg">{t("implant_abutment_description")}</p>
                    </div>

                    {/* Single Implant table */}
                    <div className="max-w-6xl mx-auto my-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("implant_single_title")}</h2>

                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("implant_single_col_manufacture")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_single_col_brands")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_single_col_price")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_single_col_warranty")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div className="text-lg">{t("implant_single_row1_manufacture")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row1_brands")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row1_price")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row1_warranty")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div className="text-lg">{t("implant_single_row2_manufacture")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row2_brands")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row2_price")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row2_warranty")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div className="text-lg">{t("implant_single_row3_manufacture")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row3_brands")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row3_price")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row3_warranty")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div className="text-lg">{t("implant_single_row4_manufacture")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row4_brands")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row4_price")}</div>
                                    <div className="text-lg text-center">{t("implant_single_row4_warranty")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All-on tables */}
                    <div className="max-w-6xl mx-auto my-10">
                        <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("implant_all_on_8_title")}</h3>
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white mb-8">
                            <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("implant_col_brands")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_warranty")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_listed_price")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_july_2025")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon_row1_brands")}</div>
                                    <div className="text-center">{t("implant_allon_row1_warranty")}</div>
                                    <div className="text-center">{t("implant_allon_row1_price")}</div>
                                    <div className="text-center">{t("implant_allon_row1_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div>{t("implant_allon_row2_brands")}</div>
                                    <div className="text-center">{t("implant_allon_row2_warranty")}</div>
                                    <div className="text-center">{t("implant_allon_row2_price")}</div>
                                    <div className="text-center">{t("implant_allon_row2_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon_row3_brands")}</div>
                                    <div className="text-center">{t("implant_allon_row3_warranty")}</div>
                                    <div className="text-center">{t("implant_allon_row3_price")}</div>
                                    <div className="text-center">{t("implant_allon_row3_special")}</div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("implant_all_on_6_title")}</h3>
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white mb-8">
                            <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("implant_col_brands")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_warranty")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_listed_price")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_july_2025")}</div>
                            </div>
                            <div className="bg-white">
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon6_row1_brands")}</div>
                                    <div className="text-center">{t("implant_allon6_row1_warranty")}</div>
                                    <div className="text-center">{t("implant_allon6_row1_price")}</div>
                                    <div className="text-center">{t("implant_allon6_row1_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div>{t("implant_allon6_row2_brands")}</div>
                                    <div className="text-center">{t("implant_allon6_row2_warranty")}</div>
                                    <div className="text-center">{t("implant_allon6_row2_price")}</div>
                                    <div className="text-center">{t("implant_allon6_row2_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon6_row3_brands")}</div>
                                    <div className="text-center">{t("implant_allon6_row3_warranty")}</div>
                                    <div className="text-center">{t("implant_allon6_row3_price")}</div>
                                    <div className="text-center">{t("implant_allon6_row3_special")}</div>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t("implant_all_on_4_title")}</h3>
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white mb-8">
                            <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("implant_col_brands")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_warranty")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_listed_price")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_col_july_2025")}</div>
                            </div>
                            <div className="bg-white">
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon4_row1_brands")}</div>
                                    <div className="text-center">{t("implant_allon4_row1_warranty")}</div>
                                    <div className="text-center">{t("implant_allon4_row1_price")}</div>
                                    <div className="text-center">{t("implant_allon4_row1_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div>{t("implant_allon4_row2_brands")}</div>
                                    <div className="text-center">{t("implant_allon4_row2_warranty")}</div>
                                    <div className="text-center">{t("implant_allon4_row2_price")}</div>
                                    <div className="text-center">{t("implant_allon4_row2_special")}</div>
                                </div>
                                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_allon4_row3_brands")}</div>
                                    <div className="text-center">{t("implant_allon4_row3_warranty")}</div>
                                    <div className="text-center">{t("implant_allon4_row3_price")}</div>
                                    <div className="text-center">{t("implant_allon4_row3_special")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Procedures */}
                    <div className="max-w-6xl mx-auto my-10">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-left text-white">{t("implant_additional_title")}</h2>
                        <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                            <div className="grid grid-cols-2 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                                <div className="px-6 py-4 text-lg">{t("implant_additional_col_service")}</div>
                                <div className="px-6 py-4 text-lg">{t("implant_additional_col_price")}</div>
                            </div>

                            <div className="bg-white">
                                <div className="grid grid-cols-2 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_additional_row1_service")}</div>
                                    <div className="text-center">{t("implant_additional_row1_price")}</div>
                                </div>
                                <div className="grid grid-cols-2 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div>{t("implant_additional_row2_service")}</div>
                                    <div className="text-center">{t("implant_additional_row2_price")}</div>
                                </div>
                                <div className="grid grid-cols-2 items-center px-6 py-6 text-gray-700">
                                    <div>{t("implant_additional_row3_service")}</div>
                                    <div className="text-center">{t("implant_additional_row3_price")}</div>
                                </div>
                                <div className="grid grid-cols-2 items-center px-6 py-6 bg-purple-50 text-gray-700">
                                    <div>{t("implant_additional_row4_service")}</div>
                                    <div className="text-center">{t("implant_additional_row4_price")}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

export default ImplantSurgeryPricing;
