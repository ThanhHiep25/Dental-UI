'use client'

import { AnimatePresence } from "framer-motion";
import { ChevronUp, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import ChatPopup from "../chatbot/ChatPopup";



const ScrollTop: React.FC = () => {
    const [showTop, setShowTop] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isChatPopUpOpen, setIsChatPopUpOpen] = useState(false);


    useEffect(() => {
        const handleScroll = () => {
            setShowTop(window.scrollY > 300);
            setShowChat(window.scrollY > 900);

            if (isChatPopUpOpen) {
                setIsChatPopUpOpen(true);
            }
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isChatPopUpOpen]);


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const toggleChatPopup = () => {
        setIsChatPopUpOpen(!isChatPopUpOpen);
    }


    return (
        <>

            {
                showChat && (
                    <button
                        onClick={toggleChatPopup}
                        className="fixed bottom-60 right-8 z-30 bg-blue-400 hover:bg-blue-500 text-white p-4 rounded-full shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group"
                        aria-label="Trở về đầu trang"
                        style={{
                            boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
                        }}
                    >
                        <MessageSquare size={20} className="group-hover:scale-110 transition-transform duration-300" />

                    </button>
                )
            }

            <AnimatePresence>
                {
                    isChatPopUpOpen && (
                        <ChatPopup onClose={toggleChatPopup} />
                    )
                }
            </AnimatePresence>

            {/* Hiển thị scroll top */}
            {showTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-35 right-8 z-30 bg-purple-400 hover:bg-purple-500 text-white p-2 rounded-full shadow-xl border-4 border-white animate-bounce-slow transition-all duration-300 flex items-center justify-center group animate-bounce"
                    aria-label="Trở về đầu trang"
                    style={{
                        boxShadow: "0 4px 24px 0 rgba(255, 193, 7, 0.4)",
                    }}
                >
                    <ChevronUp size={32} className="group-hover:scale-110 transition-transform duration-300" />

                </button>
            )}
        </>
    )
}

export default ScrollTop;