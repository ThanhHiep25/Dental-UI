'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const OrthodonticPricing: React.FC = () => {
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
            <section className="bg-[#6f65c8] py-12">
                <div className="max-w-7xl mx-auto text-center text-white px-6">
                    <h1 className="md:text-5xl text-2xl font-bold">{t('orthodontic_title')}</h1>

                    <div className="w-full mt-8 flex flex-col items-center justify-center">
                        <div className="max-w-4xl text-left mb-8">
                            <p className="text-lg text-white">{t('orthodontic_intro')}</p>
                        </div>

                        <div className="w-full max-w-5xl mb-8">
                            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                <div className="grid grid-cols-3 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                                    <div className="px-6 py-4 text-xl border-r border-white/30">{t('type_of_service')}</div>
                                    <div className="px-6 py-4 text-xl border-r border-white/30">{t('price_of_service')}</div>
                                    <div className="px-6 py-4 text-xl">{t('warranty')}</div>
                                </div>

                                <div className="bg-white">
                                    <div className="grid grid-cols-3 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_bracket_standard')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_bracket_standard_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_bracket_selfligating')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_bracket_selfligating_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_bracket_ceramic')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_bracket_ceramic_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_bracket_ceramic_selfligating')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_bracket_ceramic_selfligating_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_auxiliary_appliance')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_auxiliary_appliance_price')}</div>
                                        <div className="text-lg text-center">-</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_minivis')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_minivis_price')}</div>
                                        <div className="text-lg text-center">-</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_retainer')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_retainer_price')}</div>
                                        <div className="text-lg text-center">-</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_invisalign_1')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_invisalign_1_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_invisalign_2')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_invisalign_2_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                    <div className="grid grid-cols-3 items-center px-8 py-6 bg-purple-50 text-gray-600">
                                        <div className="text-lg">{t('orthodontic_item_invisalign_combo')}</div>
                                        <div className="text-lg text-center">{t('orthodontic_item_invisalign_combo_price')}</div>
                                        <div className="text-lg text-center">3 Years</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-start max-w-4xl mt-6">
                            <p className="text-lg text-white">{t('orthodontic_note')}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OrthodonticPricing;


