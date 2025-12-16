"use client";

import React, { useState } from 'react';
import { CircleCheck } from "lucide-react";
import {motion} from 'framer-motion'
import AppointmentModal from '@/component/model/Appointment';
import AuthModal from '@/component/auth/AuthForms';

const PorcelainVeneer: React.FC = () => {
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
      <section className="flex flex-row items-center justify-center   ">
        <div className="w-1/2">
          <h1 className="font-bold text-3xl text-amber-500">
            Hoàng thiện nụ cười nhanh nhất
          </h1>
          <p className="font-bold text-2xl text-fuchsia-800">Dán sứ Veneer</p>
          <p>
            Răng bị mẻ nhưng không muốn bọc sứ vì sợ mài răng? Veneer chính là
            giải pháp tái tạo nụ cười không làm tổn thương răng và nhanh chóng
            nhất cho bạn.
          </p>
          <button onClick={handleBookAppointment} className="w-[200px] h-[60px] bg-amber-500 rounded-2xl">
            Đặt lịch ngay
          </button>
        </div>
        <div className="w-1/">
          <motion.img
            className="w-[290px] h-[290px] rounded-2xl p-1"
            src="/IMGServices/Veneers-compressed.jpg.webp"
            alt=""
          />
        </div>
      </section>
      <section className="max-w-7xl mx-auto my-10 p-5 space-y-5 bg-purple-100">
        <div>
          <h1 className="text-center font-bold text-3xl text-fuchsia-800">
            Bạn có phù hợp dán Veneer sứ?
          </h1>
        </div>
        <div className="flex">
          <div className="w-1/2">
            <motion.img
              src="/IMGServices/porcelain_veneer/whitening-choosing-compressed.jpg"
              alt=""
              className="w-[400px] h-[400px] rounded-tr-full p-1 "
            />
            <motion.img
              src="/IMGServices/porcelain_veneer/whitening-mirror2-compressed.jpg"
              alt=""
              className="w-[400px] h-[400px] rounded-2xl p-1"
            />
          </div>
          <div className="w-2/3">
            <p>
              Veneer là 1 lớp sứ mỏng (từ 0,3 đến 0,5 mm) được cố định lên mặt
              bên ngoài của răng, giúp cho răng đều hơn và có được thẩm mỹ như
              ý. Khác với răng sứ, Veneer sứ không yêu cầu mài nhỏ răng mà chỉ
              mài một lớp mỏng từ 0,3 đến 0,5 mm - bằng miếng dán Veneer - không
              gây đau đớn và khó chịu.
            </p>
            <p className="font-bold leading-12">
              Dán sứ Veneer dùng để khắc phục các tình trạng răng như:
              <p className="flex font-medium items-center gap-2">
                <CircleCheck className="text-green-400" /> Răng sứt mẻ, bể răng
              </p>
              <p className="flex font-medium  items-center gap-2">
                <CircleCheck className="text-green-400" /> Răng vàng, không đều
                màu
              </p>
              <p className="flex font-medium  items-center gap-2">
                <CircleCheck className="text-green-400" /> Răng lệch nhẹ, không
                đều
              </p>
              <p className="flex font-medium  items-center gap-2">
                <CircleCheck className="text-green-400" />
                Răng hở, có khoảng trống
              </p>
            </p>
            <div className="w-full flex justify-center mt-5">
              <button onClick={handleBookAppointment} className="w-[400px] h-[60px] bg-amber-500 rounded-2xl">
                Đặt lịch ngay
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto my-10 p-5 space-y-5">
        <div className="flex flex-col items-center justify-center w-full ">
          <h1 className="font-bold text-purple-800 text-3xl ">
            Ưu điểm nổi bật của răng sứ Veneer
          </h1>
          <p className="text-amber-500 text-2xl">
            Giải pháp cải thiện thẩm mỹ cho nụ cười của bạn một cách nhanh chóng
          </p>
        </div>
        <div className="font-bold leading-12">
          <div className="flex font-medium items-center gap-2" >
            <CircleCheck className="text-green-400" />
            <p>
              <strong> Tác dụng chính:</strong> Tính thẩm mỹ cao, khó nhận biết
              bằng mắt thường
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
            <CircleCheck className="text-green-400" />
            <p>
             <strong> Ưu điểm nổi bật:</strong> Tối thiểu xâm lấn mô răng thật, không bị cộm
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
            <CircleCheck className="text-green-400" />
            <p>
             <strong>Khắc phục khuyết điểm:</strong>  Răng thưa, hô móm, vẩu, nứt, vỡ, xỉn màu…
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
            <CircleCheck className="text-green-400" />
            <p>
             <strong> Chức năng ăn nhai:</strong>   Tốt, tuy nhiên hạn chế các thức ăn quá cứng
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
            <CircleCheck className="text-green-400" />
            <p>
             <strong> Tuổi thọ trung bình:</strong>  Cao, từ 15 - 20 năm nếu chăm sóc và vệ sinh đúng cách
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
             <CircleCheck className="text-green-400" />
            <p>
             <strong> Cảm giác sau dán Veneer:</strong> Không đau, không ê buốt
            </p>
          </div>
          <div className="flex font-medium items-center gap-2">
            <CircleCheck className="text-green-400" />
            <p>
             <strong> Thời gian điều trị:</strong>  Ngắn, chỉ từ 2-3 lần hẹn
            </p>
          </div>
        </div>
      </section>
      <AppointmentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultTab="appointment"
        defaultServiceSlug="Dán sứ Veneer"
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

export default PorcelainVeneer;
