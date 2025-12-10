'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const VeneerPorcelainPricing: React.FC = () => {
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
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800">{t('title_veneer_porcelain')}</h1>
              <p className="mt-6 text-lg text-gray-700 max-w-2xl">{t('veneer_intro')}</p>

              <button className="mt-8 inline-flex items-center gap-3 bg-amber-400 text-white px-6 py-3 rounded-full font-semibold">
                {t('book_appointment')}
              </button>
            </div>

            <div className="w-64 h-40 rounded-xl overflow-hidden shadow-lg hidden md:block">
              <motion.img src="/IMGPrice/veneer.jpg" alt="veneer" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#6f65c8] py-12">
        <div className="max-w-7xl mx-auto text-white px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('veneer_group1')}</h2>

          <div className="w-full max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <div className="grid grid-cols-4 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                <div className="px-6 py-4 text-lg">{t('type_of_service')}</div>
                <div className="px-6 py-4 text-lg">{t('price_of_service')}</div>
                <div className="px-6 py-4 text-lg">{t('warranty')}</div>
                <div className="px-6 py-4 text-lg">{t('strength')}</div>
              </div>

              <div className="bg-white">
                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                  <div className="text-lg">{t('veneer_bio_dt_1')}</div>
                  <div className="text-lg text-center">{t('veneer_bio_dt_1_price')}</div>
                  <div className="text-lg text-center">{t('veneer_bio_dt_1_warranty')}</div>
                  <div className="text-lg text-center">{t('veneer_bio_dt_1_strength')}</div>
                </div>
                <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                  <div className="text-lg">{t('veneer_fuzir_ii')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_ii_price')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_ii_warranty')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_ii_strength')}</div>
                </div>
                <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                  <div className="text-lg">{t('veneer_fuzir_i')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_i_price')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_i_warranty')}</div>
                  <div className="text-lg text-center">{t('veneer_fuzir_i_strength')}</div>
                </div>
              </div>
            </div>

            {/* Veneer — Standard */}
            <div className="mt-12">
              <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t('veneers_title_standard')}</h3>
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                  <div className="px-6 py-4 text-lg">{t('type_of_service')}</div>
                  <div className="px-6 py-4 text-lg">{t('price_of_service')}</div>
                  <div className="px-6 py-4 text-lg">{t('warranty')}</div>
                  <div className="px-6 py-4 text-lg">{t('strength')}</div>
                </div>

                <div className="bg-white">
                  <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                    <div className="text-lg">{t('veneer_standard_v1')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v1_price')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v1_warranty')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v1_strength')}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                    <div className="text-lg">{t('veneer_standard_v2')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v2_price')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v2_warranty')}</div>
                    <div className="text-lg text-center">{t('veneer_standard_v2_strength')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Veneer — Premium */}
            <div className="mt-12">
              <h3 className="text-left text-xl font-bold text-yellow-200/80 mb-4">{t('veneers_title_premium')}</h3>
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <div className="grid grid-cols-4 bg-purple-700 h-16 items-center text-white text-center font-semibold">
                  <div className="px-6 py-4 text-lg">{t('type_of_service')}</div>
                  <div className="px-6 py-4 text-lg">{t('price_of_service')}</div>
                  <div className="px-6 py-4 text-lg">{t('warranty')}</div>
                  <div className="px-6 py-4 text-lg">{t('strength')}</div>
                </div>

                <div className="bg-white">
                  <div className="grid grid-cols-4 items-center px-6 py-6 text-gray-700">
                    <div className="text-lg">{t('veneer_mizuguchi')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_price')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_warranty')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_strength')}</div>
                  </div>
                  <div className="grid grid-cols-4 items-center px-6 py-6 bg-purple-50 text-gray-700">
                    <div className="text-lg">{t('veneer_mizuguchi_plus')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_plus_price')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_plus_warranty')}</div>
                    <div className="text-lg text-center">{t('veneer_mizuguchi_plus_strength')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-white text-lg text-center">
              <p>{t('bottom_title')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VeneerPorcelainPricing;
