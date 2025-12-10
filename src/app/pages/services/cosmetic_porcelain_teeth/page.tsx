'use client'

// Trang thông tin dịch vụ Răng Sứ Thẩm Mỹ
// File: src/app/pages/services/cosmetic_porcelain_teeth/page.tsx 
// Mô tả: Trang này cung cấp thông tin chi tiết về dịch vụ Răng Sứ Thẩm Mỹ, bao gồm các lợi ích, quy trình và hình ảnh minh họa.
// Từ khóa: Răng Sứ Thẩm Mỹ, Nha Khoa, Dịch Vụ Nha Khoa, Phục Hình Răng, Nụ Cười Đẹp 


import { motion } from 'framer-motion'
import { useEffect, useState } from 'react';
import AppointmentModal from '@/component/model/Appointment';
import { useTranslation } from "react-i18next";

const CosmeticPorcelainTeeth: React.FC = () => {

    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);



    // Translation hook
    const { t } = useTranslation();

    // Data section 2
    const data = [
        {
            id: 1,
            title: 'Không giới hạn ăn uống',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/eating-chiken-with-dental-crown-section2-1.jpg.webp',
            content: 'Công nghệ nung chậm tại phòng Lab của Cẩm Tú có thể giúp răng sứ đạt đến độ cứng 1200-1400mpa - cứng và chịu lực tốt hơn răng thật. Bạn có thể ăn uống thoải mái ngay trong ngày lắp răng.',
            status: true
        },
        {
            id: 2,
            title: 'Tiết kiệm thời gian',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/laborlatory-compressed-section2-2.jpg.webp',
            content: 'Với quy trình được thực hiện tại cơ sở - không cần gia công bên ngoài - và lấy dấu 3D, Cẩm Tú có thể đảm bảo tiến độ và chất lượng tốt nhất ở từng công đoạn. Giảm thiểu số lần hẹn, đi lại của bệnh nhân và các hạn chế của lấy dấu silicon.',
            status: true,

        },
        {
            id: 3,
            title: 'Chất Liệu Lành Tính Sinh Học',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/img-dental-section1.jpg.webp',
            content: 'Zirconium / Zirconia là chất liệu lý tưởng để áp dụng trong nha khoa vì độ cứng vượt trội, lành tính và độ tích hợp sinh học hoàn hảo. Bạn sẽ cảm thấy hoàn toàn thoải mái và không hề thấy sự khác biệt so với răng thật - kể cả về ngoại hình và chức năng ăn nhai.',
            status: true
        }, {
            id: 4,
            title: 'Toàn Hàm Trong 2-3 Ngày',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/dentist-and-patient-on-chair-compressed-section2-3.jpg.webp',
            content: 'Những ca ít hơn 5 răng với loại sứ Bio DT có thể hoàn thành ngay trong ngày. Với dòng sứ cao cấp (Fuzir hoặc Mizuguchi) và những ca toàn hàm chỉ cần 2-3 ngày.',
            status: true
        }, {
            id: 5,
            title: 'Thiết Kế Bởi Các Họa Sĩ Nha Khoa',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/dental-artists-compressed-section2-4.jpg.webp',
            content: 'Đội ngũ Nghệ nhân và Kỹ thuật viên Răng Sứ Cẩm Tú có hơn 18 năm kinh nghiệm, thiết kế hàng ngàn nụ cười mỗi năm. Răng sứ Cẩm Tú được thiết kế tự nhiên, tinh tế, hài hòa với răng thật, không cấn hoặc gây khó chịu và chịu lực tốt hơn răng thật.',
            status: true
        },
        {
            id: 6,
            title: 'Bảo vệ Môi Trường',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/silicone-and-3d-impression-dental-comparison-compressed-section2-5.jpg.webp',
            content: 'Công nghệ lấy dấu răng kỹ thuật số 3D 3Shape® cho phép Cẩm Tú lưu giữ chính xác hình ảnh, vị trí và cấu trúc của răng quý khách, loại bỏ hoàn toàn lượng silicon không cần thiết thải ra môi trường so với phương pháp lấy dấu phổ biến.',
            status: true
        }
    ]

    // Data section 4
    const datasection4 = [
        {
            id: 1,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/yellow-teeth-compressed-section4-1.jpg',
            content: 'Răng vàng, sẫm màu đậm không thể tẩy trắng',
            status: true

        },
        {
            id: 2,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/cracked-tooth-1-compressed-section4-2.jpg',
            content: 'Mẻ răng, răng bể, mòn hoặc tổn thương',
            status: true
        },
        {
            id: 3,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/failed-teeth-root-decay-compressed-section4-3.jpg',
            content: 'Răng chết tủy, nhiễm trùng',
            status: true
        },
        {
            id: 4,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/spacing-crowding-compressed-section4-4.jpg',
            content: 'Răng thưa hoặc chen chúc',
            status: true
        },
        {
            id: 5,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/overbite-underbite-compressed-section4-5.jpg',
            content: 'Răng cắn sâu, cắn ngược',
            status: true
        },
        {
            id: 6,
            title: '',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/Bone-and-tooth-loss-compressed-section4-6.jpg',
            content: 'Mất răng',
            status: true
        }
    ]

    // section 5
    const datasection5 = [
        {
            id: 1,
            title: 'Mão răng sứ',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/crown-full-compressed-section5-1.jpg',
            content: '',
            status: true

        },
        {
            id: 2,
            title: 'Cầu răng sứ',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/crown-bridge-compressed-section5-2.jpg',
            content: '',
            status: true
        },
        {
            id: 3,
            title: 'Inlay răng sứ',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/crown-inlay-compressed-section5-3.jpg',
            content: '',
            status: true
        },
        {
            id: 4,
            title: 'Onlay răng sứ',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/crown-onlay-compressed-section5-4.jpg',
            content: '',
            status: true
        }
    ]


    const datasection6 = [
        {
            id: 1,
            title: 'Khám tư vấn chuyên sâu',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/ct-scan-compressed-section6-1.jpg.webp',
            content: 'Công nghệ Scan 3D hỗ trợ bác sĩ với góc nhìn đa chiều về tình trạng răng của bạn. Cho phép bác sĩ tầm soát các nguy cơ tiềm ẩn, bệnh lý nha khoa, nha chu và tủy răng của bạn để đưa ra giải pháp răng sứ tốt nhất cho tình trạng răng miệng và chi phí của bạn.',
            status: true
        },
        {
            id: 2,
            title: 'Quy trình chuẩn bị',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/110157929_1213532545676428_4170133137363779802-section6-2.jpg.webp',
            content: 'Bác sĩ sẽ thực hiện quy trình để chuẩn bị cho việc lắp răng sứ bao gồm vệ sinh răng, lấy dấu 3D và chuẩn bị răng. Bạn sẽ không cảm thấy đau đớn, chỉ cần thư giản trên ghế và bác sĩ Cẩm Tú sẽ chăm sóc tận tình cho bạn. Răng sứ của bạn sẽ được thiết kế trong phòng Lab của Cẩm Tú ngay sau khi lấy dấu.',
            status: true
        },
        {
            id: 3,
            title: 'Gắn răng... Xong!',
            imageurl: '/IMGServices/cosmetic_porcelain_teeth/Image-compressed-section6-3.jpg.webp',
            content: 'Với những ca ít răng, việc lắp răng sứ có thể được thực hiện ngay trong ngày hoặc ngày hôm sau. Răng sứ sẽ được cố định vững chắc bằng vật liệu keo chuyên ngành bởi bác sĩ. Và thế là bạn có thể tận hưởng nụ cười của mình một cách trọn vẹn nhất!',
            status: true
        }
    ]

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
        <div className="w-full">
            <section className="flex flex-col md:flex-row items-center justify-center md:p-20 p-10 gap-10">

                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full flex flex-col gap-4 ">
                    <h1 className="text-5xl font-bold text-purple-800 roboto-900">{t('cosmetic_porcelain_teeth')}</h1>
                    <p className="text-justify indent-8 text-lg">
                        Với cơ sở Phòng Lab In-house và công nghệ lấy dấu răng 3D 3Shape®,
                        tất cả răng sứ qua quá trình nung chậm đạt được độ cứng tối đa 1400Mpa,
                        được thiết kế tự nhiên, tinh tế và phù hợp với đường nét khuôn mặt khách hàng.
                        Thông thường các ca răng sứ toàn hàm có thể hoàn thành trong vòng 2-3 ngày.
                    </p>

                    <button onClick={() => setOpen(true)} className="text-white cursor-pointer md:w-96 w-60  bg-purple-800 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-full text-lg px-5 py-6 text-center">
                        {t('book_appointment_free')}
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="w-full">
                    <motion.img src="/IMGServices/cosmetic_porcelain_teeth/img-dental-section1.jpg.webp"
                        alt="img-dental-section1"
                        className="w-full h-full max-h-[500px] object-cover rounded-3xl" />
                </motion.div>


            </section>

            <section className="bg-purple-800 w-full md:p-10 p-5">

                <div className="max-w-7xl mx-auto">

                    {
                        data && data.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {data.map((item) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: item.id * 0.2 }}
                                        key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <motion.img src={item.imageurl} alt={item.title} className="w-full h-80 object-cover rounded-2xl mb-4" />
                                        <h2 className="text-2xl font-semibold mb-4 text-purple-800">{item.title}</h2>
                                        <p className="text-gray-600 text-justify">{item.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )

                    }

                </div>

            </section>

            <section className="md:p-20 p-10 flex flex-col items-center justify-center gap-10">

                <h2 className="text-4xl font-bold text-purple-800 roboto-900 mb-10 text-center">Lấy lại sự tự tin và nâng cao chất lượng sống</h2>
                <motion.p
                    initial={{ opacity: 0, y: -100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className='max-w-7xl md:max-w-5xl text-center text-lg mx-auto'>Mất răng, mẻ răng hay răng bị bể chắc chắn đang gây khó khăn cho bạn trong việc ăn uống ngon miệng và nói chuyện lưu loát.
                    Những khoảng trống trong nụ cười làm bạn thiếu tự tin khi giao tiếp và cười nói.</motion.p>

                <motion.p
                    initial={{ opacity: 0, y: -100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className='max-w-7xl md:max-w-5xl text-center text-lg  mx-auto mt-4'>Răng sứ thẩm mỹ và phục hình nụ cười tại Cẩm Tú là phương pháp lâu dài để phục hồi nụ cười và chức năng ăn nhai của bạn,
                    lấy lại sự tự tin vốn có ngay cả khi bạn đã mất gần hết hoặc toàn bộ răng.</motion.p>

                <motion.p
                    initial={{ opacity: 0, y: -100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className='max-w-7xl md:max-w-5xl text-center text-lg mx-auto mt-4'>Với sự đầu tư về kỹ thuật, công nghệ và chọn lọc vật liệu sứ nhập khẩu của chúng tôi, những chiếc răng sứ của bạn sẽ trông hoàn toàn tự nhiên và cảm giác như răng thật.
                    Độ cứng vượt trội để bạn có thể tận hưởng ăn uống ngon miệng suốt đời, nâng cao chất lượng sống.</motion.p>


                <motion.button
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOpen(true)}
                    className="text-white cursor-pointer md:w-96 w-70  mx-auto bg-teal-400 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-full text-lg px-5 py-6 text-center">
                    Đặt Lịch Hẹn Hồi Sinh Nụ Cười
                </motion.button>
            </section>

            <section className="w-full bg-purple-800 md:p-10 p-5 flex flex-col items-center justify-center gap-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-white roboto-900 mb-10 text-center">Khi nào nên làm răng sứ thẩm mỹ?</h2>
                </div>
                <div className="max-w-7xl mx-auto">

                    {
                        datasection4 && datasection4.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {datasection4.map((item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: item.id * 0.2 }}
                                        key={item.id} className="relative rounded-2xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                                        <motion.img src={item.imageurl} alt={item.title} className="w-full h-90 object-cover rounded-2xl mb-4" />
                                        <p className="text-purple-800 text-center absolute bottom-2 w-[60%] left-1/2 -translate-x-1/2 rounded-2xl p-3 text-2xl font-bold bg-white z-10">{item.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    }

                </div>

                <h3 className="text-2xl font-bold text-white roboto-900 mt-10 text-center">Răng sứ sẽ khôi phục các khuyết điểm của nụ cười</h3>

                <button onClick={() => setOpen(true)} className="text-white cursor-pointer md:w-96 w-70  mx-auto bg-teal-400 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-purple-300 font-bold rounded-full text-lg px-5 py-6 text-center">
                    Đặt Lịch Hẹn Tư Vấn Răng Sứ
                </button>
            </section>

            <section className="w-full p-10 flex flex-col items-center justify-center gap-5">
                <h1 className='text-5xl font-bold text-teal-700 roboto-900 mb-2 text-center'>Các Loại Răng Sứ Thẩm Mỹ</h1>
                <p className='text-center text-2xl font-bold'>Tùy theo tình trạng răng của bạn mà loại răng sứ thích hợp sẽ được chỉ định</p>

                <div className="max-w-7xl mx-auto w-full">
                    {
                        datasection5 && datasection5.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {datasection5.map((item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: item.id * 0.2 }}
                                        key={item.id} className="relative  rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col items-center">
                                        <motion.img src={item.imageurl} alt={item.title} className="w-full h-60 object-cover rounded-2xl mb-4" />
                                        <h2 className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-3 w-[60%] shadow-lg text-2xl font-semibold mb-4 text-purple-800 text-center">{item.title}</h2>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    }
                </div>

                <h3 className='text-center text-2xl font-bold text-teal-700 roboto-900'>Cần thau đổi nụ cười toàn diện ?</h3>
                <h3 className='text-center text-2xl font-bold text-teal-700 roboto-900'>Hãy liên hệ với đội ngũ y bác sĩ của chúng tôi.</h3>
                <button onClick={() => setOpen(true)} className="text-white cursor-pointer md:w-96 w-70 mx-auto bg-teal-400 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-purple-300 font-bold rounded-full text-lg px-5 py-6 text-center">
                    Đặt Lịch Hẹn Ngay
                </button>
            </section>

            <section className="w-full bg-blue-100/60 p-10 flex flex-col items-center justify-center gap-10">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-purple-800 roboto-900 mb-3 text-center">Trãi Nghiệm Bọc Răng Sứ</h2>
                    <p className='text-center text-2xl font-bold'>Chúng tôi cá nhân hóa quy trình điều trị và răng sứ theo mong muốn của bạn</p>
                </div>
                <div className="max-w-7xl mx-auto">
                    {
                        datasection6 && datasection6.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {datasection6.map((item) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.8, delay: item.id * 0.2 }}
                                        key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col ">
                                        <motion.img src={item.imageurl} alt={item.title} className="w-full h-80 object-cover rounded-2xl mb-4" />
                                        <h2 className="text-2xl font-semibold mb-4 text-teal-800">{item.id}. {item.title}</h2>
                                        <p className="text-gray-600 text-justify">{item.content}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </section>

            <section className="w-full md:p-20 p-5 flex flex-col items-center justify-center gap-10 bg-gradient-to-r from-purple-800 via-teal-400 to-blue-600">
                <h2 className="text-4xl font-bold text-white roboto-900 mb-10 text-center">Sẵn sàng để có nụ cười mới?</h2>
                <motion.p
                    initial={{ opacity: 0, y: -100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                className='max-w-7xl md:max-w-5xl text-center text-lg mx-auto text-white'>Hãy để đội ngũ bác sĩ và kỹ thuật viên giàu kinh nghiệm của chúng tôi giúp bạn hồi sinh nụ cười và nâng cao chất lượng sống.
                    Chúng tôi cam kết mang đến cho bạn dịch vụ nha khoa thẩm mỹ tốt nhất với công nghệ hiện đại và vật liệu sứ cao cấp.</motion.p>
                <button onClick={() => setOpen(true)} className="text-white cursor-pointer md:w-96 w-70  mx-auto bg-teal-400 hover:bg-purple-900 focus:ring-4 focus:outline-none focus:ring-purple-300 font-bold rounded-full text-lg px-5 py-6 text-center">
                    Đặt Lịch Hẹn Tư Vấn Răng Sứ
                </button>
            </section>

        <AppointmentModal
            isOpen={open}
            onClose={() => setOpen(false)}
            defaultTab="appointment"
            defaultServiceSlug="Răng Sứ Thẩm Mỹ từ cơ bản đến cao cấp"
        />
        </div>
    )
}

export default CosmeticPorcelainTeeth;