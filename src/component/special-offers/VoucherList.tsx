'use client'

import { vouchers } from "@/data/data";

export function VoucherList() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Mã ưu đãi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vouchers.map((voucher) => (
                    <div key={voucher.id} className="p-4 bg-white border border-gray-200 rounded-lg text-center shadow-sm">
                        <h3 className="text-lg font-bold text-blue-600">{voucher.title}</h3>
                        <p className="text-gray-600 my-2 text-sm">{voucher.description}</p>
                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors">
                            Lưu mã
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}