'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, CheckCircle, Calendar, Clock, User } from 'lucide-react';
import { DentistAPI, type Dentist } from '@/services/dentist';
import ChatAPI, { AssistResponse, QuickBookingRequest } from '@/services/chat';

interface ChatPopupProps {
  onClose: () => void;
}

// Định nghĩa giao diện cho mỗi tin nhắn
interface Message {
  sender: 'user' | 'bot';
  content: React.ReactNode;
}


const chatVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { stiffness: 200, damping: 20 } },
  exit: { opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } },
};

const ChatPopup: React.FC<ChatPopupProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loadingAssist, setLoadingAssist] = useState(false);
  // const [assistData, setAssistData] = useState<AssistResponse | null>(null);
  const [selected, setSelected] = useState<QuickBookingRequest | null>(null);
  const [stage, setStage] = useState<'idle' | 'fill' | 'confirm' | 'result'>('idle');
  const [loadingBook, setLoadingBook] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loadingDentists, setLoadingDentists] = useState(false);
  // const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'), []);

  // Helpers
  const ensureSelected = useMemo(() => {
    return (seed?: Partial<QuickBookingRequest>): QuickBookingRequest => {
      return {
        fullName: '',
        email: '',
        phone: '',
        serviceId: seed?.serviceId ?? 0,
        date: seed?.date ?? '',
        time: seed?.time ?? '',
        dentistId: seed?.dentistId,
        notes: seed?.notes,
      };
    };
  }, []);

  // Load dentists when user enters fill stage (once)
  useEffect(() => {
    const loadDentists = async () => {
      try {
        setLoadingDentists(true);
        const res = await DentistAPI.getDentists();
        if (res?.success !== false && Array.isArray(res?.data)) {
          setDentists(res.data);
        } else {
          // leave dentists empty
        }
      } catch {
        // ignore, leave dentists empty
      } finally {
        setLoadingDentists(false);
      }
    };
    if (stage === 'fill' && dentists.length === 0 && !loadingDentists) {
      void loadDentists();
    }
  }, [stage, dentists.length, loadingDentists]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      // Thêm tin nhắn của người dùng vào danh sách
      const newUserMessage: Message = { sender: 'user', content: inputValue.trim() };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputValue('');

      // Gọi Assist API để gợi ý đặt lịch
      setLoadingAssist(true);
      try {
        const data: AssistResponse = await ChatAPI.assist(String(newUserMessage.content), '');
        
        // Kiểm tra type response
        if (data.type === 'chitchat') {
          // Chitchat: chỉ hiển thị reply, không có suggestions
          const reply = data.reply || data.messageSummary || 'Xin chào! Tôi có thể giúp gì cho bạn?';
          setMessages((prev) => [...prev, { 
            sender: 'bot', 
            content: <p className="text-sm text-gray-700">{reply}</p> 
          }]);
        } else {
          // Booking: hiển thị suggestions đầy đủ
          const content = (
            <div className="flex flex-col gap-3">
              {data.messageSummary && (
                <p className="text-sm text-gray-700 mb-2">{data.messageSummary}</p>
              )}
              
              {data.suggestedServices && data.suggestedServices.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Dịch vụ gợi ý:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.suggestedServices.map((s) => (
                      <button
                        key={s.id}
                        className="px-2 py-1 rounded-full text-xs border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
                        title="Bấm để chọn dịch vụ"
                        onClick={() => {
                          setSelected((prev) => {
                            const base = prev ?? ensureSelected({});
                            return { ...base, serviceId: s.id };
                          });
                          setStage('fill');
                        }}
                      >
                        {s.name}{typeof s.price === 'number' ? ` • ${s.price.toLocaleString()}đ` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {(data.suggestedDates?.length || data.suggestedTimes?.length) ? (
                <div className="text-sm text-gray-700 flex flex-col gap-2">
                  {data.suggestedDates?.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-600">Ngày:</span>
                      {data.suggestedDates.map((d, i) => (
                        <button
                          key={`${d}-${i}`}
                          className="px-2 py-1 rounded-full text-xs border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          title="Bấm để chọn ngày"
                          onClick={() => {
                            setSelected((prev) => {
                              const base = prev ?? ensureSelected({});
                              return { ...base, date: d };
                            });
                            setStage('fill');
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {data.suggestedTimes?.length ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-600">Giờ:</span>
                      {data.suggestedTimes.map((t, i) => (
                        <button
                          key={`${t}-${i}`}
                          className="px-2 py-1 rounded-full text-xs border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="Bấm để chọn giờ"
                          onClick={() => {
                            setSelected((prev) => {
                              const base = prev ?? ensureSelected({});
                              return { ...base, time: t };
                            });
                            setStage('fill');
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              
              {data.suggestedDentists && data.suggestedDentists.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Nha sĩ gợi ý:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.suggestedDentists.map((d) => (
                      <button
                        key={d.id}
                        className="px-2 py-1 rounded-full text-xs border border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100"
                        title="Bấm để chọn nha sĩ"
                        onClick={() => {
                          setSelected((prev) => {
                            const base = prev ?? ensureSelected({});
                            return { ...base, dentistId: d.id };
                          });
                          setStage('fill');
                        }}
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {data.quickBookingTemplates && data.quickBookingTemplates.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Mẫu đặt nhanh:</p>
                  <div className="grid grid-cols-1 gap-3">
                    {data.quickBookingTemplates.map((tpl, idx) => (
                      <div key={idx} className="w-full rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm hover:ring-2 hover:ring-blue-200 transition border-l-4 border-l-blue-400">
                        <div className="text-[13px] text-gray-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">Mẫu #{idx + 1}</p>
                          </div>
                          <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-600" /> <span>Ngày: <b>{tpl.date}</b></span></div>
                          <div className="flex items-center gap-2"><Clock size={14} className="text-purple-600" /> <span>Giờ: <b>{tpl.time}</b></span></div>
                          {tpl.serviceName ? <div className="flex items-center gap-2"><User size={14} className="text-emerald-600" /> <span>Dịch vụ: <b className="break-words">{tpl.serviceName}</b></span></div> : null}
                          {typeof tpl.price === 'number' ? <p>Giá dự kiến: <b>{tpl.price.toLocaleString()}đ</b></p> : null}
                          {tpl.notes ? <p className="text-gray-600">Ghi chú: {tpl.notes}</p> : null}
                        </div>
                        <div className="mt-3">
                          <button
                            className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md text-sm hover:from-blue-700 hover:to-indigo-700"
                            onClick={() => {
                              setSelected({
                                fullName: '',
                                email: '',
                                phone: '',
                                serviceId: tpl.serviceId,
                                date: tpl.date,
                                time: tpl.time,
                                dentistId: tpl.preferredDentistId,
                                notes: tpl.notes,
                              });
                              setStage('fill');
                            }}
                          >
                            Sử dụng mẫu này
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              
              {!data.suggestedServices?.length && !data.quickBookingTemplates?.length && (
                <p className="text-sm text-gray-600">Chưa có gợi ý cụ thể. Bạn có thể nhập thông tin để đặt lịch.</p>
              )}
            </div>
          );
          setMessages((prev) => [...prev, { sender: 'bot', content }]);
        }
      } catch {
        // Nếu Assist lỗi, fallback trả lời chung từ /generate
        try {
          const gen = await ChatAPI.generate(String(newUserMessage.content), '');
          const reply = gen?.reply || 'Xin lỗi, hiện chưa có gợi ý. Vui lòng thử lại sau.';
          setMessages((prev) => [...prev, { sender: 'bot', content: <p className="text-sm text-gray-700">{reply}</p> }]);
        } catch {
          setMessages((prev) => [...prev, { sender: 'bot', content: <p className="text-sm text-red-600">Không thể xử lý lúc này. Bạn vui lòng thử lại.</p> }]);
        }
      } finally {
        setLoadingAssist(false);
      }
    }
  };

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = document.querySelector('.custom-scrollbar');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <motion.div
  className="fixed bottom-30 right-8 z-50 w-80 md:w-96 max-h-[70vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      variants={chatVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-3xl">
        <div className="flex items-center gap-3" title='Chat bot HoangBinh Dental - Đã xác minh'>
          <motion.img src="/LOGO/tooth.png" alt="logo tooth" className="w-8 h-8 rounded-full bg-white/90 p-1" />
          <div className="leading-tight">
            <div className="flex items-center gap-1">
              <span className="font-semibold">HoangBinh Dental</span>
              <CheckCircle size={16} className="text-emerald-300" />
            </div>
            <p className="text-xs text-white/80">Trợ lý đặt lịch nhanh</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Đóng chat"
        >
          <X size={20} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gradient-to-bl from-purple-200 via-white to-blue-200">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Chào bạn! Chúng tôi có thể giúp gì cho bạn?</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-3 rounded-2xl max-w-[80%] shadow-sm ${message.sender === 'user' ? 'bg-yellow-300/40 backdrop-blur text-gray-700 ml-auto' : 'bg-white/80 text-gray-800 mr-auto border border-purple-200'
                }`}
            >
              {message.content}
            </div>
          ))
        )}

        {/* Panel điền thông tin đặt nhanh */}
        {stage === 'fill' && selected && (
          <div className="mt-3 p-3 bg-white/90 rounded-xl text-gray-700 shadow">
            <p className="font-semibold mb-2">Điền thông tin đặt lịch</p>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="text-xs text-gray-600">Họ và tên</label>
                <input className="border rounded px-2 py-1 w-full" placeholder="Nguyễn Văn A" value={selected.fullName}
                       onChange={(e) => { setSelected({ ...selected, fullName: e.target.value }); setFieldErrors((p) => ({ ...p, fullName: '' })); }} />
                {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600">Email</label>
                <input className="border rounded px-2 py-1 w-full" placeholder="email@domain.com" value={selected.email}
                       onChange={(e) => { setSelected({ ...selected, email: e.target.value }); setFieldErrors((p) => ({ ...p, email: '' })); }} />
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600">Số điện thoại</label>
                <input className="border rounded px-2 py-1 w-full" placeholder="09xx xxx xxx" value={selected.phone}
                       onChange={(e) => { setSelected({ ...selected, phone: e.target.value }); setFieldErrors((p) => ({ ...p, phone: '' })); }} />
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600">Service ID</label>
                <input className="border rounded px-2 py-1 w-full" placeholder="Ví dụ: 101" value={selected.serviceId}
                       onChange={(e) => { setSelected({ ...selected, serviceId: Number(e.target.value) || 0 }); setFieldErrors((p) => ({ ...p, serviceId: '' })); }} />
                {fieldErrors.serviceId && <p className="text-xs text-red-600 mt-1">{fieldErrors.serviceId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Ngày</label>
                  <input className="border rounded px-2 py-1 w-full" type="date" value={selected.date}
                         onChange={(e) => { setSelected({ ...selected, date: e.target.value }); setFieldErrors((p) => ({ ...p, date: '' })); }} />
                  {fieldErrors.date && <p className="text-xs text-red-600 mt-1">{fieldErrors.date}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-600">Giờ</label>
                  <input className="border rounded px-2 py-1 w-full" type="time" value={selected.time}
                         onChange={(e) => { setSelected({ ...selected, time: e.target.value }); setFieldErrors((p) => ({ ...p, time: '' })); }} />
                  {fieldErrors.time && <p className="text-xs text-red-600 mt-1">{fieldErrors.time}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Chọn nha sĩ (tuỳ chọn)</label>
                {loadingDentists ? (
                  <div className="border rounded px-2 py-1 w-full text-sm text-gray-500 bg-gray-50">Đang tải danh sách nha sĩ...</div>
                ) : (
                  <select
                    className="border rounded px-2 py-1 w-full bg-white"
                    value={selected.dentistId ?? ''}
                    onChange={(e) => setSelected({ ...selected, dentistId: e.target.value ? Number(e.target.value) : undefined })}
                  >
                    <option value="">— Không chọn —</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}{d.specialization ? ` • ${d.specialization}` : ''}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-600">Ghi chú</label>
                <textarea className="border rounded px-2 py-1 w-full" placeholder="Mô tả thêm..." value={selected.notes || ''}
                          onChange={(e) => setSelected({ ...selected, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => { setSelected(null); setStage('idle'); setFieldErrors({}); }}>Huỷ</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => {
                // simple client validation
                const errs: Record<string, string> = {};
                if (!selected.fullName) errs.fullName = 'Vui lòng nhập họ tên';
                if (!selected.email) errs.email = 'Vui lòng nhập email';
                if (!selected.phone) errs.phone = 'Vui lòng nhập số điện thoại';
                if (!selected.serviceId) errs.serviceId = 'Vui lòng nhập Service ID';
                if (!selected.date) errs.date = 'Vui lòng chọn ngày';
                if (!selected.time) errs.time = 'Vui lòng chọn giờ';
                setFieldErrors(errs);
                if (Object.keys(errs).length === 0) setStage('confirm');
              }}>Tiếp tục</button>
            </div>
          </div>
        )}

        {/* Panel xác nhận */}
        {stage === 'confirm' && selected && (
          <div className="mt-3 p-3 bg-white/95 rounded-xl text-gray-700 shadow">
            <p className="font-semibold mb-2">Xác nhận đặt lịch</p>
            <ul className="text-sm space-y-1">
              <li><b>Họ tên:</b> {selected.fullName}</li>
              <li><b>Email:</b> {selected.email}</li>
              <li><b>Điện thoại:</b> {selected.phone}</li>
              <li><b>Service ID:</b> {selected.serviceId}</li>
              <li><b>Ngày:</b> {selected.date} — <b>Giờ:</b> {selected.time}</li>
              {selected.dentistId ? <li><b>Dentist ID:</b> {selected.dentistId}</li> : null}
              {selected.notes ? <li><b>Ghi chú:</b> {selected.notes}</li> : null}
            </ul>
            {bookError && <p className="text-sm text-red-600 mt-2">{bookError}</p>}
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 bg-gray-200 rounded" onClick={() => setStage('fill')}>Quay lại</button>
              <button
                className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60"
                disabled={loadingBook}
                onClick={async () => {
                  setBookError(null);
                  // Validate required
                  const req = selected;
                  if (!req.fullName || !req.email || !req.phone || !req.serviceId || !req.date || !req.time) {
                    setBookError('Vui lòng điền đầy đủ thông tin bắt buộc.');
                    return;
                  }
                  setLoadingBook(true);
                  try {
                    await ChatAPI.book(req);
                    setMessages((prev) => [...prev, {
                      sender: 'bot',
                      content: (
                        <div>
                          <p className="font-semibold text-green-700">Đặt lịch thành công!</p>
                          <p className="text-sm">Chúng tôi đã ghi nhận yêu cầu của bạn cho {req.date} {req.time}.</p>
                        </div>
                      )
                    }]);
                    setStage('result');
                    setSelected(null);
                  } catch (e: unknown) {
                    const err = e as { response?: { data?: { message?: string } } ; message?: string };
                    const msg = err?.response?.data?.message || err?.message || 'Đặt lịch thất bại, vui lòng thử lại.';
                    setBookError(msg);
                  } finally {
                    setLoadingBook(false);
                  }
                }}
              >
                {loadingBook ? 'Đang tạo...' : 'Xác nhận đặt lịch'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-300 flex items-center rounded-b-3xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          className="flex-1 bg-white text-gray-600 p-2 rounded-lg focus:outline-none"
          placeholder="Nhập tin nhắn của bạn..."
        />
        <button
          onClick={handleSendMessage}
          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
          aria-label="Gửi tin nhắn"
          disabled={loadingAssist}
          title={loadingAssist ? 'Đang xử lý...' : 'Gửi'}
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default ChatPopup;
