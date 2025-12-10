"use client"

import{ useState } from 'react';
import AppointmentModal from '@/component/model/Appointment';

const FullMouthDentalImplants: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="">
      <section>
        <div className="flex flex-col max-w-7xl mx-auto my-10 p-5 space-y-5 text-xl ">
          <h1 className="font-bold text-3xl text-amber-500 ">
            Giải pháp toàn diện cho người mất răng
          </h1>
          <p className="font-bold text-2xl text-purple-800 ">
            Implant Toàn Hàm
          </p>
          <p>
            Bạn gặp khó khăn khi nhai thức ăn, cảm thấy tự ti khi cười nói, hoặc
            thấy khó khăn trong phát âm do mất răng? Implant toàn hàm là giải
            pháp toàn diện giúp bạn khắc phục những vấn đề này.
          </p>
          <div className="">
            <button onClick={() => setOpen(true)} className="w-[400px] h-[50px] bg-amber-500 rounded-2xl flex items-center justify-center ">
                Đăt lịch ngay
            </button>
          </div>
        </div>
      </section>
      <AppointmentModal
        isOpen={open}
        onClose={() => setOpen(false)}
        defaultTab="appointment"
        defaultServiceSlug="Implant Toàn Hàm Giải Pháp Toàn Diện Cho Người Mất Răng"
      />
    </div>
  );
};
export default FullMouthDentalImplants;
