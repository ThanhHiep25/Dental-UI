'use client';
import { useState } from 'react';
import RoulettePro from 'react-roulette-pro'; // Sửa lỗi import ở đây
import 'react-roulette-pro/dist/index.css'; // QUAN TRỌNG: Đã import CSS
import Image from 'next/image';
import { wheelPrizes as initialPrizes } from '@/data/data';

// TẠO DỮ LIỆU ĐÚNG CHUẨN: Thêm thuộc tính 'image'
// Use varied placeholder images so the wheel looks more realistic until real assets are added.
const prizes = initialPrizes.map((prize, index) => ({
  id: `prize-${index}`,
  // Use picsum with seed so each prize has a stable but different image
  image: `https://picsum.photos/seed/prize${index}/80/80`,
  text: prize.option,
}));

export function LuckyWheel() {
  const [start, setStart] = useState(false);
  // State này lưu ID của giải thưởng được chọn (client-side simulation)
  const [winningPrizeId, setWinningPrizeId] = useState<string | null>(null);
  // UI states
  const [showResult, setShowResult] = useState(false);
  const [resultPrize, setResultPrize] = useState<{ id: string; text: string; image: string } | null>(null);

  const handleSpinClick = () => {
    // Client-side simulation: pick a random winner index and start
    if (start) return; // prevent double clicks

    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const winner = prizes[winnerIndex];

    if (!winner) {
      console.error('No prize found for random index', winnerIndex);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
      return;
    }

    // Save selected prize id and start the wheel
    setWinningPrizeId(winner.id);
    setStart(true);
    // Keep result prize ready to show after spin ends
    setResultPrize({ id: winner.id, text: winner.text, image: winner.image });
  };
  
  // Hàm được gọi khi vòng quay dừng lại
  const handlePrizeDefined = () => {
    const prize = prizes.find(p => p.id === winningPrizeId) || resultPrize;
    if (prize) {
      // Show a nice modal/result instead of alert
      setShowResult(true);
    }

    // Reset start so button becomes enabled for next spin
    setStart(false);
  };

  // Local props for RoulettePro to avoid typing conflicts with the library's types
  const rouletteOptions = {
    stopInCenter: false,
    spinDuration: 3,
  } as unknown;

  const rouletteClasses = {
    wrapper: 'max-w-xs md:max-w-sm bg-white rounded-full p-4 shadow-xl',
    prizeImage: 'w-12 h-12 rounded-full object-cover mb-1',
    prizeText: 'text-xs',
  } as unknown;

  return (
    <div className="flex flex-col items-center mt-8">
      <h2 className="text-2xl font-bold mb-4">Vòng quay may mắn</h2>
      <div className="relative">
        {/* pointer */}
        <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-x-8 border-x-transparent border-b-12 border-b-red-600" />
        </div>

        <RoulettePro
          prizes={prizes}
          start={start}
          // When not started prizeIndex can be 0
          prizeIndex={winningPrizeId !== null ? prizes.findIndex(p => p.id === winningPrizeId) : 0}
          onPrizeDefined={handlePrizeDefined}
          options={rouletteOptions as unknown as never}
          classes={rouletteClasses as unknown as never}
        />
      </div>

      <button
        onClick={handleSpinClick}
        disabled={start}
        className={`mt-6 px-6 py-3 text-white font-semibold rounded-full shadow-md transition-colors ${start ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'}`}
      >
        {start ? 'Đang quay...' : 'Quay ngay'}
      </button>

      {/* Result modal */}
      {showResult && resultPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowResult(false)} />
            <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-lg">
              <h3 className="text-lg font-bold mb-3">Chúc mừng!</h3>
              <div className="mx-auto mb-3 w-24 h-24 relative">
                <Image src={resultPrize.image} alt={resultPrize.text} fill className="rounded-full object-cover" />
              </div>
              <p className="font-semibold mb-4">Bạn đã trúng: <span className="text-red-600">{resultPrize.text}</span></p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-md"
                onClick={() => {
                  setShowResult(false);
                  // Clear selection so user can spin again
                  setWinningPrizeId(null);
                  setResultPrize(null);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}