 'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ChildrenDentalPricing: React.FC = () => {
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
    <div>
      <section className="bg-[#6f65c8] py-12">
        <div className="max-w-7xl mx-auto text-center text-white px-6">
          <h1 className="md:text-5xl text-2xl font-bold">{t('children_dental_title')}</h1>

          <div className="w-full mt-8 flex flex-col items-center justify-center">
            <div className="max-w-4xl text-left mb-8">
              <p className="text-lg text-white">{t('children_dental_intro')}</p>
            </div>

            <div className="w-full max-w-4xl mb-8">
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                  <div className="px-6 py-4 text-xl border-r border-white/30">{t('type_of_service')}</div>
                  <div className="px-6 py-4 text-xl">{t('price_of_service')}</div>
                </div>

                <div className="bg-white">
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg">{t('children_item_exam')}</div>
                    <div className="text-lg text-center">{t('children_item_exam_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                    <div className="text-lg">{t('children_item_extraction_no_anesthesia')}</div>
                    <div className="text-lg text-center">{t('children_item_extraction_no_anesthesia_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg">{t('children_item_fluoride_1_5')}</div>
                    <div className="text-lg text-center">{t('children_item_fluoride_1_5_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                    <div className="text-lg">{t('children_item_fluoride_5_10')}</div>
                    <div className="text-lg text-center">{t('children_item_fluoride_5_10_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg">{t('children_item_fluoride_full')}</div>
                    <div className="text-lg text-center">{t('children_item_fluoride_full_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                    <div className="text-lg">{t('children_item_pedo_filling_simple')}</div>
                    <div className="text-lg text-center">{t('children_item_pedo_filling_simple_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg">{t('children_item_pedo_filling_ii')}</div>
                    <div className="text-lg text-center">{t('children_item_pedo_filling_ii_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                    <div className="text-lg">{t('children_item_extraction_with_anesthesia')}</div>
                    <div className="text-lg text-center">{t('children_item_extraction_with_anesthesia_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg">{t('children_item_pedo_endodontic_1')}</div>
                    <div className="text-lg text-center">{t('children_item_pedo_endodontic_1_price')}</div>
                  </div>
                  <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                    <div className="text-lg">{t('children_item_pedo_endodontic_2')}</div>
                    <div className="text-lg text-center">{t('children_item_pedo_endodontic_2_price')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-start max-w-4xl mt-6">
              <p className="text-lg text-white">{t('children_dental_note')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChildrenDentalPricing;
