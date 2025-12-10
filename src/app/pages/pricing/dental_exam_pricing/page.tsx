'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const DentalExamPricing: React.FC = () => {
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
          <h1 className="md:text-5xl text-2xl font-bold">{t('table_price')}</h1>

          <div className="w-full mt-12 flex flex-col items-center justify-center">
            {/* General Exam */}
            <div className="w-full max-w-3xl mb-8">
              <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                  <div className="px-6 py-4 text-xl border-r border-white/30">{t('type_of_service')}</div>
                  <div className="px-6 py-4 text-xl">{t('price_of_service')}</div>
                </div>

                <div className="bg-white">
                  <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                    <div className="text-lg font-bold">{t('dental_exam')}</div>
                    <div className="text-lg font-bold text-center">{t('free')}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-start max-w-4xl mb-8">
              <p className="text-xl text-white">{t('des_dental_exam1')}</p>
            </div>

            {/* In-depth consultation */}
            <div className="w-full max-w-3xl mb-8">
              <h3 className="text-start text-2xl font-bold text-yellow-200/80">{t('dental_exam_deep')}</h3>
              <div className="mt-6">
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                    <div className="px-6 py-4 text-xl border-r border-white/30">{t('type_of_service')}</div>
                    <div className="px-6 py-4 text-xl">{t('price_of_service')}</div>
                  </div>

                  <div className="bg-white">
                    <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                      <div className="text-lg font-bold">{t('dental_exam_deep')}</div>
                      <div className="text-lg font-bold text-center">{t('dental_exam_deep_price')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-start max-w-4xl mb-8">
              <p className="text-xl text-white">{t('des_imaging')}</p>
            </div>

            {/* Imaging */}
            <div className="w-full max-w-3xl mb-8">
              <h3 className="text-start text-2xl font-bold text-yellow-200/80">{t('Scan 3D CT')}</h3>
              <div className="mt-6">
                <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                  <div className="grid grid-cols-2 bg-purple-700 h-20 items-center text-white text-center font-semibold">
                    <div className="px-6 py-4 text-xl border-r border-white/30">{t('type_of_service')}</div>
                    <div className="px-6 py-4 text-xl">{t('price_of_service')}</div>
                  </div>

                  <div className="bg-white">
                    <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                      <div className="text-lg font-bold">{t('ct_3d')}</div>
                      <div className="text-lg font-bold text-center">{t('ct_3d_price')}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center px-8 py-6 bg-purple-50 text-gray-600">
                      <div className="text-lg font-bold">{t('periapical')}</div>
                      <div className="text-lg font-bold text-center">{t('periapical_price')}</div>
                    </div>
                    <div className="grid grid-cols-2 items-center px-8 py-6 text-gray-600">
                      <div className="text-lg font-bold">{t('pano_ceph')}</div>
                      <div className="text-lg font-bold text-center">{t('pano_ceph_price')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-start max-w-4xl mt-8">
              <p className="text-xl text-white">{t('bottom_title')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DentalExamPricing;
