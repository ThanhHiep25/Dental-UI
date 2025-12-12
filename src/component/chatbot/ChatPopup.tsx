'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, CheckCircle, Calendar, Clock, User, Trash } from 'lucide-react';
import { DentistAPI, type Dentist } from '@/services/dentist';
import ChatAPI, { AssistResponse, QuickBookingRequest } from '@/services/chat';
import { getServices, type Service } from '@/services/services';

interface ChatPopupProps {
  onClose: () => void;
}

// Định nghĩa giao diện cho mỗi tin nhắn
interface Message {
  sender: 'user' | 'bot';
  content: React.ReactNode;
  meta?: any;
}

// Serializable form stored in localStorage
interface StoredMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  meta?: any;
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
  const [serviceNames, setServiceNames] = useState<Record<number, string>>({});
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

  // Heuristic: detect booking intent locally if backend generate() doesn't return intent/type
  const isBookingLike = (text: string): boolean => {
    const t = (text || '').toLowerCase();
    // Phủ nhiều biến thể hơn: đặt lịch, đặt hẹn, lên lịch, chốt lịch, đăng ký lịch, muốn hẹn/đặt, book/booking/appointment/schedule
    return /(\bđặt\s*(?:lịch|hẹn|dịch vụ|slot|suất|lịch\s*khám)\b|\blên\s*lịch\b|\bchốt\s*lịch\b|\bđăng\s*ký\s*lịch\b|\bmuốn\s*(?:hẹn|đặt)\b|\bbook(?:ing)?\b|\bappointment\b|\bschedule\b)/.test(t);
  };

  // Date helpers: normalize incoming dates for input[type=date] and format to backend MM/dd/yyyy
  const normalizeToInputDate = (raw: string): string => {
    // Accept: MM/dd/yyyy | dd/MM/yyyy | yyyy-MM-dd
    if (!raw) return '';
    // Already ISO-like
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    // MM/dd/yyyy
    const mmdd = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (mmdd) {
      const [, mm, dd, yyyy] = mmdd;
      return `${yyyy}-${mm}-${dd}`;
    }
    // dd/MM/yyyy
    const ddmm = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmm) {
      const [, dd, mm, yyyy] = ddmm;
      return `${yyyy}-${mm}-${dd}`;
    }
    return raw;
  };

  const formatToBackendDate = (raw: string): string => {
    // Expect input as yyyy-MM-dd or other, return MM/dd/yyyy per backend
    if (!raw) return '';
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const [, yyyy, mm, dd] = iso;
      return `${mm}/${dd}/${yyyy}`;
    }
    // If already MM/dd/yyyy, keep
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
    // If dd/MM/yyyy, swap
    const ddmm = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (ddmm) {
      const [, dd, mm, yyyy] = ddmm;
      return `${mm}/${dd}/${yyyy}`;
    }
    return raw;
  };

  // Parse booking hints (date/time/email/phone) from free text to prefill form
  const toPad2 = (n: number) => n.toString().padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${toPad2(d.getMonth() + 1)}-${toPad2(d.getDate())}`;

  const nextWeekday = (start: Date, target: number) => {
    const d = new Date(start);
    const diff = (target + 7 - d.getDay()) % 7 || 7; // next occurrence (not today)
    d.setDate(d.getDate() + diff);
    return d;
  };

  const parseBookingHints = (text: string): Partial<QuickBookingRequest> => {
    const result: Partial<QuickBookingRequest> = {};
    const t = (text || '').toLowerCase().trim();

    // Email
    const emailMatch = t.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (emailMatch) result.email = emailMatch[0];

    // Phone (VN): accept +84..., 0x..., allow spaces/dots
    const phoneMatch = t.replace(/[ .-]/g, '').match(/(?:\+?84|0)\d{8,10}/);
    if (phoneMatch) {
      let ph = phoneMatch[0];
      if (ph.startsWith('+84')) ph = '0' + ph.slice(3);
      if (ph.startsWith('84')) ph = '0' + ph.slice(2);
      result.phone = ph;
    }

    // Time variants: 9h, 9h30, 9:30, 09:00, 9 giờ, 9 g, 9 rưỡi
    let time: string | undefined;
    const timeColon = t.match(/\b(\d{1,2}):(\d{2})\b/);
    if (timeColon) {
      const hh = Math.min(23, Math.max(0, parseInt(timeColon[1], 10)));
      const mm = Math.min(59, Math.max(0, parseInt(timeColon[2], 10)));
      time = `${toPad2(hh)}:${toPad2(mm)}`;
    } else {
      const timeH = t.match(/\b(\d{1,2})\s*(?:h|giờ|g)\s*(\d{1,2})?\b/);
      if (timeH) {
        const hh = Math.min(23, Math.max(0, parseInt(timeH[1], 10)));
        const mm = timeH[2] ? Math.min(59, Math.max(0, parseInt(timeH[2], 10))) : 0;
        time = `${toPad2(hh)}:${toPad2(mm)}`;
      } else {
        const ruoi = t.match(/\b(\d{1,2})\s*(?:rưỡi)\b/);
        if (ruoi) {
          const hh = Math.min(23, Math.max(0, parseInt(ruoi[1], 10)));
          time = `${toPad2(hh)}:30`;
        }
      }
    }
    if (!time) {
      if (/\bsáng\s*(nay)?\b/.test(t) || /\bsáng\b/.test(t)) time = '09:00';
      else if (/\btrưa\b/.test(t)) time = '12:00';
      else if (/\bđầu\s*chiều\b/.test(t)) time = '13:30';
      else if (/\bchiều\s*(nay)?\b/.test(t)) time = '15:00';
      else if (/\bcuối\s*chiều\b/.test(t)) time = '16:30';
      else if (/\btối\s*(nay)?\b/.test(t) || /\btối\b/.test(t)) time = '19:00';
    }
    if (time) result.time = time;

    // Date explicit: dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd, MM/dd/yyyy
    let dateStr: string | undefined;
    const explicit = t.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (explicit) {
      const dd = toPad2(parseInt(explicit[1], 10));
      const mm = toPad2(parseInt(explicit[2], 10));
      const yyyy = explicit[3];
      // Assume dd/MM/yyyy and convert to yyyy-MM-dd
      dateStr = `${yyyy}-${mm}-${dd}`;
    } else {
      const iso = t.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
      if (iso) {
        const yyyy = iso[1], mm = iso[2], dd = iso[3];
        dateStr = `${yyyy}-${mm}-${dd}`;
      }
    }

    // Relative dates: hôm nay, mai/ngày mai, mốt, thứ [2-7]/CN, ... này, tuần sau
    if (!dateStr) {
      const today = new Date();
      if (/\bhôm nay\b/.test(t)) {
        dateStr = formatYMD(today);
      } else if (/\b(ngày mai|mai)\b/.test(t)) {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        dateStr = formatYMD(d);
      } else if (/\bmốt\b/.test(t)) {
        const d = new Date(today);
        d.setDate(d.getDate() + 2);
        dateStr = formatYMD(d);
      } else {
        // Thứ 2..7, CN ("thứ 7 này", "cn này")
        const thu = t.match(/\bthứ\s*(\d)(?:\s*này)?\b/);
        if (thu) {
          const w = parseInt(thu[1], 10); // 2..7
          // JS: 0=CN,1=T2,...,6=T7
          const target = (w % 7) + 1; // map 2..7 -> 2..7; will adjust below
          const d = nextWeekday(today, target > 6 ? 0 : target);
          dateStr = formatYMD(d);
        } else if (/\b(cn|chủ\s*nhật)(?:\s*này)?\b/.test(t)) {
          const d = nextWeekday(today, 0);
          dateStr = formatYMD(d);
        } else if (/\btuần sau\b/.test(t)) {
          const d = new Date(today);
          d.setDate(d.getDate() + 7);
          dateStr = formatYMD(d);
        }
      }
    }
    if (dateStr) result.date = dateStr;

    // Heuristic full name: "tôi tên|mình tên|em tên|anh tên|chị tên", "tôi là|mình là|em là|anh là|chị là" + tên đến hết câu/ngắt dòng
    const nameMatch = text.match(/\b(?:tôi|mình|em|anh|chị)\s*(?:tên|là)\s*([^,.;\n\r]{2,60})/i);
    if (nameMatch) {
      const rawName = nameMatch[1].trim();
      if (rawName && rawName.length <= 60) result.fullName = rawName;
    }

    return result;
  };

  // --- Chat persistency helpers ---
  const getChatStorageKey = (): string => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const id = parsed?.id || parsed?.username || parsed?.email || parsed?.userId || 'user';
        return `chat_history:${String(id)}`;
      }
    } catch {
      // ignore
    }
    return 'chat_history:anon';
  };

  const extractTextFromNode = (node: React.ReactNode): string => {
    if (node == null) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractTextFromNode).filter(Boolean).join('\n');
    if (React.isValidElement(node)) {
      // @ts-ignore children may exist
      const { type, props } = node as any;
      // handle explicit <br />
      if (typeof type === 'string' && type.toLowerCase() === 'br') return '\n';

      const childrenText = extractTextFromNode(props?.children);
      // treat block-level tags as paragraph breaks
      const blockTags = typeof type === 'string' && ['p', 'div', 'li', 'section', 'article', 'header', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'table', 'tr'].includes(type.toLowerCase());
      if (blockTags) {
        return (childrenText ? childrenText.trim() + '\n' : '\n');
      }
      // fragments or inline elements: keep gentle spacing
      return childrenText ? childrenText.trim() + ' ' : '';
    }
    // fallback
    try {
      return String(node);
    } catch {
      return '';
    }
  };

  const serializeMessages = (msgs: Message[]): StoredMessage[] => {
    return msgs.map(m => {
      const text = extractTextFromNode(m.content).trim() || (m.sender === 'user' ? '...' : '...');
      const ts = (m as any).timestamp || Date.now();
      const out: StoredMessage = { sender: m.sender, text, timestamp: ts };
      if ((m as any).meta) out.meta = (m as any).meta;
      return out;
    });
  };

  const renderAssistPreview = (data: any): React.ReactNode => {
    if (!data) return null;
    const intro = data.messageSummary || data.reply || '';
    return (
      <div className="flex flex-col gap-3">
        {intro ? <p className="text-sm text-gray-700 mb-2">{intro}</p> : null}
        {Array.isArray(data.suggestedServices) && data.suggestedServices.length > 0 && (
          <div className="text-sm text-gray-700">
            <ul className="space-y-1">
              {data.suggestedServices.map((s: any, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="font-medium">{s.name || s.serviceName || s.title}</div>
                  {s.price ? <div className="text-xs text-gray-500">• {s.price}</div> : null}
                </li>
              ))}
            </ul>
          </div>
        )}
        {Array.isArray(data.suggestedDates) && data.suggestedDates.length > 0 && (
          <div className="text-sm text-gray-700">
            <div className="font-medium">Gợi ý ngày:</div>
            <div className="flex gap-2 flex-wrap">{data.suggestedDates.map((d: any, idx: number) => <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{d}</span>)}</div>
          </div>
        )}
        {Array.isArray(data.suggestedTimes) && data.suggestedTimes.length > 0 && (
          <div className="text-sm text-gray-700">
            <div className="font-medium">Gợi ý giờ:</div>
            <div className="flex gap-2 flex-wrap">{data.suggestedTimes.map((t: any, idx: number) => <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">{t}</span>)}</div>
          </div>
        )}
        {Array.isArray(data.suggestedDentists) && data.suggestedDentists.length > 0 && (
          <div className="text-sm text-gray-700">
            <div className="font-medium">Gợi ý bác sĩ:</div>
            <ul className="space-y-1">
              {data.suggestedDentists.map((d: any, i: number) => <li key={i} className="text-xs">{d.name || d}</li>)}
            </ul>
          </div>
        )}
        {Array.isArray(data.quickBookingTemplates) && data.quickBookingTemplates.length > 0 && (
          <div className="text-sm text-gray-700">
            <div className="font-medium">Mẫu đặt nhanh:</div>
            <div className="flex flex-col gap-2">
              {data.quickBookingTemplates.map((t: any, i: number) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-xs border">{t.title || t.notes || `${t.serviceName || ''} ${t.date || ''} ${t.time || ''}`}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Load history on mount
  useEffect(() => {
    try {
      const key = getChatStorageKey();
      const raw = localStorage.getItem(key);
      if (raw) {
        let parsed: any = JSON.parse(raw);
        // support legacy shapes: { messages: [...] } or direct array
        if (!Array.isArray(parsed) && parsed && Array.isArray(parsed.messages)) parsed = parsed.messages;

        if (Array.isArray(parsed) && parsed.length > 0) {
          const restored: Message[] = parsed.map((s: any) => {
            if (typeof s === 'string') return { sender: 'bot', content: s };
            if (s && typeof s === 'object') {
              const sender = s.sender === 'user' ? 'user' : 'bot';
              const text = s.text ?? s.content ?? s.message ?? '';
              return { sender, content: String(text) };
            }
            return { sender: 'bot', content: String(s) };
          });
          setMessages(restored);
        }
      }
    } catch {
      // ignore load errors
    }
  }, []);

  // Save history when messages change
  useEffect(() => {
    try {
      const key = getChatStorageKey();
      const serial = serializeMessages(messages).slice(-100); // keep last 100 messages
      localStorage.setItem(key, JSON.stringify(serial));
    } catch {
      // ignore save errors
    }
  }, [messages]);

  const clearHistory = () => {
    try {
      const key = getChatStorageKey();
      localStorage.removeItem(key);
    } catch { }
    setMessages([]);
  };

  // Normalize Vietnamese: remove diacritics and lowercase for fuzzy contains matching
  const norm = (s?: string) => (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

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

  // Load available services to map serviceId -> serviceName for display
  useEffect(() => {
    const loadServices = async () => {
      try {
        const list: Service[] = await getServices();
        if (Array.isArray(list) && list.length > 0) {
          const names: Record<number, string> = {};
          list.forEach(s => { if (s && typeof s.id === 'number') names[s.id] = s.name; });
          if (Object.keys(names).length > 0) setServiceNames(prev => ({ ...prev, ...names }));
        }
      } catch {
        // ignore service load errors
      }
    };

    void loadServices();
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      // Thêm tin nhắn của người dùng vào danh sách
      const newUserMessage: Message = { sender: 'user', content: inputValue.trim() };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputValue('');

      // Bước 1: Gọi /generate để trả lời tự nhiên và (nếu có) phát hiện intent
      setLoadingAssist(true);
      try {
        const userText = String(newUserMessage.content);
        const gen = await ChatAPI.generate(userText, '');
        const replyText = gen?.reply;
        const hints = parseBookingHints(userText);
        const looksLikeBooking = (gen?.type === 'booking') || (/BOOKING/i.test(gen?.intent || '')) || isBookingLike(userText) || Boolean(hints.date || hints.time || hints.phone || hints.email);

        if (!looksLikeBooking) {
          // Trả lời chitchat/QA tự nhiên
          const textReply = replyText || 'Tôi có thể giúp gì thêm cho bạn?';
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', content: <p className="text-sm text-gray-700">{textReply}</p>, meta: { type: 'text', text: textReply } },
          ]);
        } else {
          // Bước 2: Intent là booking → gọi /assist để lấy suggestions (services/dates/times/dentists/templates)
          const data: AssistResponse = await ChatAPI.assist(userText, '');

          // Cập nhật map serviceId -> serviceName để hiển thị tên dịch vụ trong form/confirm
          const names: Record<number, string> = {};
          if (Array.isArray(data.suggestedServices)) {
            data.suggestedServices.forEach(s => { if (s?.id && s?.name) names[s.id] = s.name; });
          }
          if (Array.isArray(data.quickBookingTemplates)) {
            data.quickBookingTemplates.forEach(t => { if (t?.serviceId && t?.serviceName) names[t.serviceId] = t.serviceName; });
          }
          if (Object.keys(names).length > 0) {
            setServiceNames(prev => ({ ...prev, ...names }));
          }

          // Cố gắng nhận diện dịch vụ mà user đề cập trong câu chat để prefill serviceId
          let matchedServiceId: number | undefined;
          if (Array.isArray(data.suggestedServices) && data.suggestedServices.length > 0) {
            const userNorm = norm(userText);
            const byName = data.suggestedServices.find(s => s?.name && userNorm.includes(norm(s.name)));
            if (byName?.id) matchedServiceId = byName.id;
            // Nếu user nói "dịch vụ này/đó" mà không nêu tên, chọn gợi ý đầu
            if (!matchedServiceId && /\bdịch\s*vụ\s*(này|đó|trên)\b/i.test(userText)) {
              matchedServiceId = data.suggestedServices[0].id;
            }
          }

          if (data.type === 'chitchat') {
            const reply = data.reply || data.messageSummary || replyText || 'Xin chào! Tôi có thể giúp gì cho bạn?';
            setMessages((prev) => [...prev, { sender: 'bot', content: <p className="text-sm text-gray-700">{reply}</p>, meta: { type: 'text', text: reply } }]);
          } else {
            const intro = data.messageSummary || replyText;
            const content = (
              <div className="flex flex-col gap-3">
                {intro && (
                  <p className="text-sm text-gray-700 mb-2">{intro}</p>
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
                                return { ...base, date: normalizeToInputDate(d) };
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

                {data.mlRecommendations && data.mlRecommendations.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Độ phù hợp AI (TF-IDF):</p>
                    <div className="flex flex-wrap gap-2">
                      {data.mlRecommendations.map((rec, i) => {
                        const name = data.suggestedServices?.find(s => s.id === rec.id)?.name;
                        const label = name ? `${name}` : `Service #${rec.id}`;
                        return (
                          <span
                            key={`${rec.id}-${i}`}
                            className="px-2 py-1 rounded-full text-[11px] border border-amber-300 bg-amber-50 text-amber-800"
                            title={`Score: ${rec.score.toFixed(3)}`}
                          >
                            {label} • {rec.score.toFixed(2)}
                          </span>
                        );
                      })}
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
                                  date: normalizeToInputDate(tpl.date),
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
            setMessages((prev) => [...prev, { sender: 'bot', content, meta: { type: 'assist', data } }]);

            // Auto-open form fill with best-effort prefill when user intends to book
            try {
              // Prefer quick booking template if present
              let seed: Partial<QuickBookingRequest> | undefined;
              if (data.quickBookingTemplates && data.quickBookingTemplates.length > 0) {
                const tpl = data.quickBookingTemplates[0];
                seed = {
                  serviceId: tpl.serviceId,
                  date: normalizeToInputDate(tpl.date),
                  time: tpl.time,
                  dentistId: tpl.preferredDentistId,
                  notes: tpl.notes,
                };
              } else {
                // Otherwise, if single suggestions provided, prefill them
                const svc = (data.suggestedServices?.length === 1) ? data.suggestedServices[0] : undefined;
                const dte = (data.suggestedDates?.length === 1) ? data.suggestedDates[0] : undefined;
                const tme = (data.suggestedTimes?.length === 1) ? data.suggestedTimes[0] : undefined;
                const den = (data.suggestedDentists?.length === 1) ? data.suggestedDentists[0] : undefined;
                seed = {
                  serviceId: matchedServiceId ?? (svc?.id || 0),
                  date: dte ? normalizeToInputDate(dte) : '',
                  time: tme || '',
                  dentistId: den?.id,
                };
              }
              // Merge parsed hints to override suggested seed where user explicitly provided info
              const merged: Partial<QuickBookingRequest> = {
                ...seed,
                ...(hints.date ? { date: hints.date } : {}),
                ...(hints.time ? { time: hints.time } : {}),
                ...(hints.email ? { email: hints.email } : {}),
                ...(hints.phone ? { phone: hints.phone } : {}),
              };
              setSelected((prev) => prev ?? ensureSelected(merged));
              setStage('fill');
            } catch {
              // ignore prefill errors
              setSelected((prev) => prev ?? ensureSelected(hints));
              setStage('fill');
            }
          }
        }
      } catch {
        // Nếu generate/assist lỗi, trả lời fallback ngắn gọn
        const errText = 'Không thể xử lý lúc này. Bạn vui lòng thử lại.';
        setMessages((prev) => [...prev, { sender: 'bot', content: <p className="text-sm text-red-600">{errText}</p>, meta: { type: 'text', text: errText } }]);
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
        <div className="flex items-center gap-3">
          <button
            onClick={clearHistory}
            className="text-white/80 hover:text-white/90 transition-colors p-2 rounded"
            aria-label="Xoá lịch sử chat"
            title="Xoá lịch sử chat"
          >
            <Trash size={18} />
          </button>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded"
            aria-label="Đóng chat"
          >
            <X size={20} />
          </button>
        </div>
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
          <div className="mt-3 p-4 md:p-5 bg-white/95 rounded-2xl text-gray-800 shadow-lg ring-1 ring-gray-200/60 backdrop-blur">
            <p className="text-base font-semibold mb-3 text-gray-900">Điền thông tin đặt lịch</p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Họ và tên</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${fieldErrors.fullName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="Nguyễn Văn A"
                  value={selected.fullName}
                  onChange={(e) => { setSelected({ ...selected, fullName: e.target.value }); setFieldErrors((p) => ({ ...p, fullName: '' })); }}
                />
                {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Email</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="email@domain.com"
                  value={selected.email}
                  onChange={(e) => { setSelected({ ...selected, email: e.target.value }); setFieldErrors((p) => ({ ...p, email: '' })); }}
                />
                {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Số điện thoại</label>
                <input
                  className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                  placeholder="09xx xxx xxx"
                  value={selected.phone}
                  onChange={(e) => { setSelected({ ...selected, phone: e.target.value }); setFieldErrors((p) => ({ ...p, phone: '' })); }}
                />
                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Dịch vụ</label>
                {Object.keys(serviceNames).length > 0 ? (
                  <select
                    className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 transition ${fieldErrors.serviceId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    value={selected.serviceId || ''}
                    onChange={(e) => { setSelected({ ...selected, serviceId: e.target.value ? Number(e.target.value) : 0 }); setFieldErrors((p) => ({ ...p, serviceId: '' })); }}
                  >
                    <option value="">— Chọn dịch vụ —</option>
                    {Object.entries(serviceNames).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${fieldErrors.serviceId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    placeholder="Nhập ID dịch vụ (nếu biết)"
                    value={selected.serviceId}
                    onChange={(e) => { setSelected({ ...selected, serviceId: Number(e.target.value) || 0 }); setFieldErrors((p) => ({ ...p, serviceId: '' })); }}
                  />
                )}
                {fieldErrors.serviceId && <p className="text-xs text-red-600 mt-1">{fieldErrors.serviceId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Ngày</label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.date ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    type="date"
                    value={selected.date}
                    onChange={(e) => { setSelected({ ...selected, date: e.target.value }); setFieldErrors((p) => ({ ...p, date: '' })); }}
                  />
                  {fieldErrors.date && <p className="text-xs text-red-600 mt-1">{fieldErrors.date}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Giờ</label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${fieldErrors.time ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    type="time"
                    value={selected.time}
                    onChange={(e) => { setSelected({ ...selected, time: e.target.value }); setFieldErrors((p) => ({ ...p, time: '' })); }}
                  />
                  {fieldErrors.time && <p className="text-xs text-red-600 mt-1">{fieldErrors.time}</p>}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Chọn nha sĩ (tuỳ chọn)</label>
                {loadingDentists ? (
                  <div className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 bg-gray-50">Đang tải danh sách nha sĩ...</div>
                ) : (
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
                <label className="text-xs text-gray-600 mb-1 block">Ghi chú</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition min-h-20"
                  placeholder="Mô tả thêm..."
                  value={selected.notes || ''}
                  onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button className="px-3.5 py-2.5 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition" onClick={() => { setSelected(null); setStage('idle'); setFieldErrors({}); }}>Huỷ</button>
              <button className="px-3.5 py-2.5 rounded-lg text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={() => {
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
              <li>
                <b>Dịch vụ:</b> {serviceNames[selected.serviceId] ? (
                  <span>{serviceNames[selected.serviceId]}</span>
                ) : (
                  <span>ID {selected.serviceId}</span>
                )}
              </li>
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
                    const payload = { ...req, date: formatToBackendDate(req.date) };
                    await ChatAPI.book(payload);
                    setMessages((prev) => [...prev, {
                      sender: 'bot',
                      content: (
                        <div>
                          <p className="font-semibold text-green-700">Đặt lịch thành công!</p>
                          <p className="text-sm">Chúng tôi đã ghi nhận yêu cầu của bạn cho {payload.date} {req.time}.</p>
                        </div>
                      )
                    }]);
                    setStage('result');
                    setSelected(null);
                  } catch (e: unknown) {
                    const err = e as { response?: { data?: { message?: string } }; message?: string };
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
