'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';


const About: React.FC = () => {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, [])


    const data = [
        {
            id: 1,
            title: 'Core title_1',
            content: 'Core content_1',
            status: true
        },
        {
            id: 2,
            title: 'Core title_2',
            content: 'Core content_2',
            status: true
        },
        {
            id: 3,
            title: 'Core title_3',
            content: 'Core content_3',
            status: true
        },
        {
            id: 4,
            title: 'Core title_4',
            content: 'Core content_4',
            status: true
        },

    ]

    // const dtaDoctor = [
    //     {
    //         id: 1,
    //         name: 'Nguyễn Thị Ngọt',
    //         position: 'Y sĩ',
    //         image: '/IMGABOUT/GPHN/CCHN-NGUYEN-THI-NGOT.jpg.webp',
    //         lang: 'vi',
    //         status: true
    //     },
    //     {
    //         id: 2,
    //         name: 'Trần Thị Cẩm Vân',
    //         position: 'Bs',
    //         image: '/IMGABOUT/GPHN/9.Tran-T-Cam-Van.jpg.webp',
    //         lang: 'vi',
    //         status: true
    //     },
    //     {
    //         id: 3,
    //         name: 'Lâm Trần Thảo Vy',
    //         position: 'Bs',
    //         image: '/IMGABOUT/GPHN/z5331162770955_8de7d3820be9ed6a714681a53f70079d.jpg.webp',
    //         lang: 'vi',
    //         status: true
    //     },
    //     {
    //         id: 4,
    //         name: 'Roel Genove Serrano',
    //         position: 'Dr',
    //         image: '/IMGABOUT/GPHN/DR.-ROEL-CCHN.jpg.webp',
    //         lang: 'en',
    //         status: true
    //     },
    //     {
    //         id: 5,
    //         name: 'Bằng Chuyên Khoa I',
    //         position: '',
    //         image: '/IMGABOUT/GPHN/BANG-CHUYEN-KHOA-CAP-I.-DR.-VAN-1.jpg.webp',
    //         lang: 'exp',
    //         status: true
    //     },
    //     {
    //         id: 6,
    //         name: 'Giấy Phép Hoạt Động',
    //         position: '',
    //         image: '/IMGABOUT/GPHN/8.-Giay-ghep-hoat-dong-12.2021.jpg.webp',
    //         lang: 'exp',
    //         status: true
    //     }
    // ]

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
        <div className="w-full h-full">
            <section className='w-full mt-20 flex md:flex-row flex-col gap-3 max-w-7xl mx-auto p-5 pb-30'>
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 w-full leading-7">
                    <h1 className='text-5xl roboto-900 text-purple-800 mb-5'>{t('Exquisite beauty and practical application')}</h1>
                    <p className='text-justify text-lg'>{t('t_banner_about')}</p>
                    <div className="mt-5 text-lg leading-10 roboto-900 text-purple-800">
                        <p>🍃 {t('t_banner_about_1')} </p>
                        <p>🍃 {t('t_banner_about_2')} </p>
                        <p>🍃 {t('t_banner_about_3')} </p>
                        <p>🍃 {t('t_banner_about_4')} </p>
                    </div>

                    {/* <button className="bg-cyan-300 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-full mt-5 text-xl h-16 roboto-900 w-full">
                        {t('book_consultation_now')}
                    </button> */}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="md:w-1/2 w-full h-full flex justify-center items-center rounded-2xl overflow-hidden border-4 border-purple-300 shadow-lg">
                    <video autoPlay loop muted src="/IMGServices/invisalign_orthodontics/Camtu-Invisalign-compressed.mp4" 
                    />
                </motion.div>

            </section>


            <section className="bg-purple-700 w-full p-20">
                <h2 className="text-center text-white text-5xl roboto-900 mb-5">
                    {t('Core values')}
                </h2>

                <div className="grid md:grid-cols-4 grid-cols-1 gap-5">
                    {
                        data.map((item, index) => {
                            if (item.status) {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: -100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        key={index} className="text-white rounded-lg shadow-md p-5 flex flex-col justify-center items-center leading-7">
                                        <p className='p-2 w-10 h-10 text-center bg-blue-500 rounded-full mb-5'>{item.id}</p>
                                        <h3 className="text-xl font-bold  mb-2">{t(item.title)}</h3>
                                        <p className="text-justify">{t(item.content)}</p>
                                    </motion.div>
                                )
                            }
                        })
                    }
                </div>


                <h2 className="text-center text-yellow-500 text-5xl roboto-900 mt-20">
                    {t('Scan 3D CT')}
                </h2>


                <div className="max-w-5xl mx-auto md:p-5">
                    <motion.p
                        initial={{ opacity: 0, y: -100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-justify text-lg mt-5 text-white ">
                        {t('Scan3D_content_1')}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: -100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-justify text-lg mt-5 text-white ">
                        {t('Scan3D_content_2')}
                    </motion.p>
                </div>


                <div className="max-w-5xl mx-auto mt-10">
                    <div className="w-full h-[512px] bg-gray-400 flex justify-center items-center rounded-2xl">
                        <video autoPlay loop muted src="/IMGServices/invisalign_orthodontics/Camtu-Invisalign-compressed.mp4" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                </div>

            </section>

            {/* <section className="max-w-7xl mx-auto md:p-5">
                <h1 className='text-center text-5xl roboto-900 text-purple-800 mt-20 mb-5'>{t('Medical Practice Certificate')}</h1>
                <div className="flex items-center justify-center flex-wrap gap-5 mt-5">
                    {
                        dtaDoctor.map((item, index) => {
                            if (item.lang === "vi") {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        key={index} className="flex flex-col w-[250px] h-auto ">
                                        <div className="md:col-span-2 col-span-1">
                                            <motion.img className="w-full h-[350px] object-fill rounded-2xl border-2 border-gray-400" src={item.image} alt="" />
                                        </div>
                                        <div className="md:col-span-2 col-span-1">
                                            <p className='text-center mt-5 text-xl roboto-900 text-emerald-700'>{item.position} . {item.name}</p>
                                        </div>
                                    </motion.div>
                                )
                            }
                        })
                    }
                </div>

                <div className="flex items-center justify-center flex-wrap gap-5 mt-5">
                    {
                        dtaDoctor.map((item, index) => {
                            if (item.lang === "en") {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        key={index} className="flex flex-col w-[250px] h-auto ">
                                        <div className="md:col-span-2 col-span-1">
                                            <motion.img className="w-full h-[350px] object-fill rounded-2xl border-2 border-gray-400" src={item.image} alt="" />
                                        </div>
                                        <div className="md:col-span-2 col-span-1">
                                            <p className='text-center mt-5 text-xl roboto-900 text-emerald-700'>{item.position} . {item.name}</p>
                                        </div>
                                    </motion.div>
                                )
                            }
                        })
                    }
                </div>

                <div className="flex items-center justify-center flex-wrap gap-5 mt-5">
                    {
                        dtaDoctor.map((item, index) => {
                            if (item.lang === "exp") {
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.2 }}
                                        key={index} className="flex flex-col w-[550px] h-auto ">
                                        <div className="md:col-span-2 col-span-1">
                                            <motion.img className="w-full h-[350px] object-fill rounded-2xl border-2 border-gray-400" src={item.image} alt="" />
                                        </div>
                                        <div className="md:col-span-2 col-span-1">
                                            <p className='text-center mt-5 text-xl roboto-900 text-emerald-700'>{item.name}</p>
                                        </div>
                                    </motion.div>
                                )
                            }
                        })
                    }
                </div>

            </section> */}
        </div>
    )
}

export default About;