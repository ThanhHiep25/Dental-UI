
'use client';
import { useState, useEffect } from 'react';

export function LuckyNumberGame() {
  const [userNumber, setUserNumber] = useState('');
  const [luckyNumber, setLuckyNumber] = useState('?????');
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [result, setResult] = useState('');

  useEffect(() => {
    // Logic WebSocket và countdown timer giữ nguyên
    if (timeLeft <= 0) {
      const newLuckyNumber = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
      setLuckyNumber(newLuckyNumber);
      if (userNumber === newLuckyNumber) {
        setResult('✨ Chúc mừng! Bạn đã trúng voucher 20%!');
      } else {
        setResult('Rất tiếc, chúc bạn may mắn lần sau.');
      }
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, userNumber]);

  const progress = (timeLeft / 300) * 100;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Dự đoán số may mắn</h2>
      <div className="p-6 bg-white border border-gray-200 rounded-lg text-center shadow-sm">
        <p className="text-gray-700">Một số may mắn sẽ được tạo ra sau:</p>
        <p className="text-3xl font-bold text-red-500 my-2">
          {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
        </p>
        
        {/* Thanh progress tự làm bằng Tailwind */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>

        <p className="text-5xl font-bold tracking-widest text-gray-800 my-4">{luckyNumber}</p>
        
        <div className="my-4 flex justify-center items-center gap-4">
            <input
                type="text"
                placeholder="Nhập số của bạn (5 chữ số)"
                value={userNumber}
                onChange={e => setUserNumber(e.target.value)}
                maxLength={5}
                className="w-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                Dự đoán
            </button>
        </div>
        {result && <p className="text-blue-600 font-semibold">{result}</p>}
      </div>
    </div>
  );
}