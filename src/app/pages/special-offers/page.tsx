'use client';

import { LuckyNumberGame } from "@/component/special-offers/LuckyNumberGame";
import { LuckyWheel } from "@/component/special-offers/LuckyWheel";
import { VoucherList } from "@/component/special-offers/VoucherList";


const  SpecialOfferPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Ưu đãi đặc biệt ✨
      </h1>      
      <VoucherList />
      <hr className="my-8 border-gray-200" />
      <LuckyWheel />
      <hr className="my-8 border-gray-200" />
      <LuckyNumberGame />
    </div>
  );

}

export default SpecialOfferPage
