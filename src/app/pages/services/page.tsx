'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'



const Services: React.FC = () => {

    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState<number | false>(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, [])
    

    const services = [
        {
            id: 1,
            title: 'cosmetic_porcelain_teeth',
            description: 'cosmetic_porcelain_teeth',
            image: '/IMGServices/dental-crown-compressed.jpg.webp',
            content: 'cosmetic_porcelain_teeth',
            link: '/pages/services/cosmetic_porcelain_teeth',
            status: true
        }, {
            id: 2,
            title: 'porcelain_veneer',
            description: 'porcelain_veneer',
            image: '/IMGServices/Veneers-compressed.jpg.webp',
            content: 'porcelain_veneer',
            link: '/pages/services/porcelain_veneer',
            status: true
        },
        {
            id: 3,
            title: 'periodontic_gum_diseases',
            description: 'periodontic_gum_diseases',
            image: '/IMGServices/Periodontic-2-compresesd.jpg.webp',
            content: 'periodontic_gum_diseases',
            link: '/pages/services/periodontic_gum_diseases',
            status: true

        },
        {
            id: 4,
            title: 'General Examination Service',
            description: 'General Examination Service',
            image: '/IMGServices/Wisdom-Teeth-compressed.jpg.webp',
            content: 'General Examination Service',
            link: '/services/general_examination_service',
            status: true
        }
    ]

    // Hàm xuất hình cơ bản theo id
    const handleHover = (index: number) => {
        setIsHovered(index);
    };

    const handleLeave = () => {
        setIsHovered(false);
    };


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
        <div className="w-full relative max-w-7xl mx-auto mb-40 p-10">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                exit={{ opacity: 0, y: -20 }}
                className='md:text-5xl text-3xl font-bold text-center text-purple-800 mt-20 mb-10'>
                Dịch Vụ Nha Khoa
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                exit={{ opacity: 0, y: -20 }}
                className='text-lg text-center max-w-4xl mx-auto'>Hoang Binh mang lại cho bàn trải nghiệm hoàn thiện nụ cười thoải mái nhất bằng cách điều trị một cách triệt để các vấn đề về răng miệng,
                chăm sóc mọi mặt từ khi bạn bước vào và theo dõi hậu điều trị để đảm bảo mọi thứ được hoàn hảo nhất có thể.</motion.p>


            <div className="grid md:grid-cols-4 grid-cols-2 gap-4 mt-20">

                {
                    services.map((service) => (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            exit={{ opacity: 0, y: -20 }}
                            key={service.id}
                            onMouseEnter={() => handleHover(service.id)}
                            onMouseLeave={() => handleLeave()}
                            className="bg-white rounded-lg shadow-md relative">
                            <motion.img src={service.image} alt={service.title} className="w-full h-68 rounded-2xl object-cover mb-4" />
                            <div className="rounded-2xl text-center shadow-xl py-4">
                                <h2 className="text-xl text-purple-800 font-semibold mb-2">{t(service.title)}</h2>
                                <button onClick={()=> {
                                    window.location.href=service.link
                                }} className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-8 rounded-full transition-colors duration-300">Xem chi tiết</button>
                            </div>
                            {
                                isHovered === service.id && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        key={service.id}
                                        className="absolute top-[40%] left-0 transform -translate-y-1/2 w-full bg-black/20 backdrop-blur-2xl h-40 bg-opacity-50 flex items-center justify-center"

                                    >
                                        <p className="text-white text-center">{t(service.content)}</p>
                                    </motion.div>
                                )
                            }

                        </motion.div>
                    ))
                }

            </div>

        </div>
    )
}

export default Services;