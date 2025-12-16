"use client";
import React, { useState } from 'react';
import AppointmentModal from '@/component/model/Appointment';
import AuthModal from '@/component/auth/AuthForms';

const PeriodonticGumDiseases: React.FC = () => {
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
    <div className="">
        <section>
        <div className="flex flex-col max-w-7xl mx-auto my-10 p-5 space-y-5 text-xl ">
            <h1 className="font-bold text-3xl text-amber-500">Bảo vệ sức khỏe của bạn!</h1>
            <p className="font-bold text-2xl text-purple-800">Điều Trị Nha Chu</p>
            <p>Bạn cảm thấy đau đớn và khó chịu ở vùng nướu răng? Hãy đến nha sĩ ngay trong thời gian sớm nhất để tránh các trường hợp bệnh nướu tiềm ẩn làm hỏng nụ cười của bạn…</p>
            <div className="">
                <button onClick={handleBookAppointment} className="w-[400px] h-[50px] bg-amber-500 rounded-2xl flex items-center justify-center ">Đăt lịch ngay</button>
            </div>
        </div>
        
        </section>
        <AppointmentModal
          isOpen={open}
          onClose={() => setOpen(false)}
          defaultTab="appointment"
          defaultServiceSlug="Điều trị nha chu"
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
export default PeriodonticGumDiseases;