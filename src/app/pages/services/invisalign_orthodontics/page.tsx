"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion"
import AppointmentModal from '@/component/model/Appointment';
import AuthModal from '@/component/auth/AuthForms';

const InvisalingnOrthodontics: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleBookAppointment = () => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!user) {
      setAuthOpen(true);
    } else {
      setOpen(true);
    }
  };
  return (
    <div>
      <section className="flex max-w-7xl mx-auto my-10 p-5 space-y-5 text-xl ">
        <div className="w-1/2 ">
          <h1 className="font-bold text-amber-500 text-3xl">
            Mang lại nụ cười hoàn hảo
          </h1>
          <p className="font-bold text-purple-800 text-2xl">
            Chỉnh nha Invisalign
          </p>
          <p>
            Giải pháp công nghệ cao cho nụ cười tự tin của bạn. Niềng răng (hay
            còn được gọi là chỉnh nha) là phương pháp sử dụng các khí cụ nha
            khoa chuyên dụng để dịch chuyển răng và xương hàm sai lệch về đúng
            vị trí.
          </p>
          <div className="flex items-center justify-center">
            <button onClick={handleBookAppointment} className="w-[400px] h-[50px] bg-amber-500 rounded-2xl flex items-center justify-center ">
              Đăt lịch ngay
            </button>
          </div>
        </div>
        <div className="w-1/2 ">
          <video
            src="/IMGServices/invisalign_orthodontics/Camtu-Invisalign-compressed.mp4"
            autoPlay={true}
            loop
            muted
            className="w-full object-cover rounded-2xl border-4 border-purple-200"
          ></video>
        </div>
      </section>
      <section className="bg-purple-100 max-w-7xl mx-auto my-10 p-5 space-y-5">
        <div className="flex flex-col items-center justify-center w-full my-10 text-center max-w-7xl mx-auto p-5 space-y-5">
          <h1 className="font-bold text-3xl text-purple-800">
            Bạn có cần niềng răng không?
          </h1>
          <p className="text-xl">
            Chỉnh nha dành cho tất cả mọi người, nụ cười hoàn hảo có thể đạt
            được với giải pháp phù hợp. Các giải pháp chỉnh nha hiện đại của
            chúng tôi sẽ cải thiện tình trạng răng miệng của bạn, giúp bạn tự
            tin hơn với nụ cười của mình. Bạn đang có những vấn đề:
          </p>
        </div>
        <div className="flex items-center justify-center w-full">
          <div className="grid grid-cols-3 gap-5 my-5">
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/khopcanho_s1.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800">
                Khớp cắn hở
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/rang-thua_s.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800 ">Răng thưa</p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/khopcanchenchuc_s.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800 ">Khớp chen chúc</p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/khopcheo_s.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800 ">Khớp cắn chéo</p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/khopcanho_s.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800 ">Khớp cắn sâu(Hô)</p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-lg">
              <motion.img
                src="/IMGServices/invisalign_orthodontics/khopbimom-cannguoc.png"
                alt=""
                className="w-[300px] h-[200px]"
              />
              <p className="text-center text-lg font-bold text-purple-800 ">Khớp cắn ngược (móm) </p>
            </div>

          </div>
        </div>
        <div className=" flex items-center justify-center ">
          <button onClick={handleBookAppointment} className="w-[400px] h-[50px] bg-amber-500 rounded-2xl text-xl ">Đặt lịch tư vấn</button>
        </div>
      </section>
      <AppointmentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultTab="appointment"
        defaultServiceSlug="Chỉnh nha Invisalign"
      />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          setOpen(true);
        }}
      />
    </div>
  );
};

export default InvisalingnOrthodontics;
