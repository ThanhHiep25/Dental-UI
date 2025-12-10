'use client'

import LadingPage from "@/component/lading/page";
import AppointmentModal from "@/component/model/Appointment";
import { motion } from "framer-motion";
import { CalendarHeart, MapPin, MessagesSquare, PhoneCall } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {


  const [showChat, setShowChat] = useState(false);
  const [isChatPopUpOpen, setIsChatPopUpOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [isOpenModelAppoit, setIsOpenModelAppoit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);


  const handleOpenModal = () => {
    setIsOpenModelAppoit(true);
  };

  // Hàm để đóng modal
  const handleCloseModal = () => {
    setIsOpenModelAppoit(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowChat(window.scrollY > 900);

      if (isChatPopUpOpen) {
        setIsChatPopUpOpen(true);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isChatPopUpOpen])


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
    <div className="relative">

      <LadingPage />
      {/* Hiển thị chatbot  */}
      {
        showChat && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed top-30 right-8 z-30 bg-purple-400 hover:bg-blue-500 text-white p-4 rounded-xl shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group"
            aria-label="Hotline"
            title="Hotline"
            style={{
              boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
            }}
          >
            <PhoneCall size={20} className="group-hover:scale-110 transition-transform duration-300" />

          </motion.button>
        )
      }

      {/* Hiển thị chat zalo */}
      {
        showChat && (
          <motion.button
            onClick={() => {
              window.open('https://chat.zalo.me/?c=4773896718585266549', '_blank');
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed top-50 right-8 z-30 bg-purple-400 hover:bg-blue-500 text-white p-4 rounded-xl shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group"
            aria-label="Zalo"
            title="Zalo"
            style={{
              boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
            }}
          >
            <MessagesSquare size={20} className="group-hover:scale-110 transition-transform duration-300" />

          </motion.button>
        )
      }


      {/* Hiển thị map */}
      {
        showChat && (
          <motion.button
            onClick={() => {
              window.open('https://maps.app.goo.gl/J74DrooSWSHaLLqx6', '_blank');
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed top-70 right-8 z-30 bg-purple-400 hover:bg-blue-500 text-white p-4 rounded-xl shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group"
            aria-label="Địa chỉ"
            title="Địa chỉ"
            style={{
              boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
            }}
          >
            <MapPin size={20} className="group-hover:scale-110 transition-transform duration-300" />

          </motion.button>
        )
      }

      {/* Hiển thị đặt lịch hẹn */}
      {
        showChat && (
          <motion.button
            onClick={handleOpenModal}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed top-90 right-8 z-30 bg-purple-400 hover:bg-blue-500 text-white p-4 rounded-xl shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group"
            aria-label="Địa chỉ"
            title="Địa chỉ"
            style={{
              boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
            }}
          >
            <CalendarHeart size={20} className="group-hover:scale-110 transition-transform duration-300" />

          </motion.button>
        )
      }

      {/* Tích hợp component AppointmentModal */}
      <AppointmentModal
        isOpen={isOpenModelAppoit}
        onClose={handleCloseModal}
      />
    </div>
  );
}
