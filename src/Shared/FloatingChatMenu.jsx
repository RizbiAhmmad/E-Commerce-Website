import React, { useState } from 'react';
import {
  FaFacebookMessenger,
  FaWhatsapp,
  FaPhone,
  FaTimes,
  FaCommentDots,
} from 'react-icons/fa';

export default function FloatingChatMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: <FaFacebookMessenger />,
      label: 'Messenger',
      bg: 'bg-blue-600',
      link: 'https://www.facebook.com/bangladeshiitbd',
    },
    {
      icon: <FaWhatsapp />,
      label: 'WhatsApp',
      bg: 'bg-green-500',
      link: 'https://wa.me/+8801560023160',
    },
    {
      icon: <FaPhone />,
      label: 'Call Us',
      bg: 'bg-green-400',
      link: 'tel:+8801560023160',
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 md:bottom-12 md:right-16 z-[9999] flex flex-col items-end space-y-3">
      {/* Action buttons */}
      <div
        className={`flex flex-col items-end space-y-3 transform transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'
        }`}
      >
        {menuItems.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-lg ${item.bg} hover:scale-105 transition`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm hidden sm:inline">{item.label}</span>
          </a>
        ))}

        <button
          onClick={() => setIsOpen(false)}
          className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:rotate-90 transform transition"
          aria-label="Close chat menu"
        >
          <FaTimes />
        </button>
      </div>

      {/* Floating toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-cyan-500 text-white shadow-xl hover:scale-110 transition animate-pulse"
          aria-label="Open chat menu"
        >
          <FaCommentDots size={20} />
        </button>
      )}
    </div>
  );
}
