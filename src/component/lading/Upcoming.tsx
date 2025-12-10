
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';


const upcomingEvents = [
  {
    id: 1,
    title: 'smile_design1',
    imageURL: '/LOGO/Logo_Horizontal_Light_1-1024x237.png.webp',
    description: 'smile_des1',
    date: '15/10/2024',
  },
  {
    id: 2,
    title: 'smile_design2',
    imageURL: '',
    description: 'smile_des2',
    date: '2',
  },
  {
    id: 3,
    title: 'smile_design3',
    imageURL: '/LOGO/Logo_Horizontal_Light_1-1024x237.png.webp',
    description: 'smile_des3',
    date: '01/07/2025',
  },
];

const UpcomingEvents: React.FC = () => {

  const { t } = useTranslation();
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center text-yellow-500 mb-12"
        >
           {t('smile_design')}
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl roboto-900 font-bold text-center bg-gradient-to-br from-purple-600 to-yellow-500 bg-clip-text text-transparent mb-12"
        >
          {t('golden_ratio_cosmetic_porcelain_teeth')}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="flex items-center justify-center h-80 bg-gray-300 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Video 1
            </h3>
          </div>
          <div className="flex items-center justify-center h-80 bg-gray-300 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Video 2
            </h3>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: event.id * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 text-center"
            >
              <h3 className="text-xl font-bold text-purple-400 mb-2"> {t(event.title)}</h3>
              <p className="text-gray-600 mb-4"> {t(event.description)}</p>
              <p className="text-sm font-semibold text-blue-500">Ngày: {event.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;