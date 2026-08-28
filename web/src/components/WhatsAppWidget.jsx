import React, { useState } from 'react';
import { X } from 'lucide-react';

const WhatsAppIcon = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16.03 3C8.85 3 3 8.84 3 16.02c0 2.3.6 4.54 1.75 6.52L3 29l6.64-1.7a13 13 0 0 0 6.39 1.68h.01c7.18 0 13.02-5.84 13.02-13.02C29.05 8.8 23.2 3 16.03 3Zm0 23.77a10.72 10.72 0 0 1-5.47-1.5l-.4-.24-3.94 1 1.05-3.83-.26-.4a10.74 10.74 0 1 1 9.02 4.97Zm5.89-8.05c-.32-.16-1.9-.94-2.2-1.05-.29-.1-.5-.16-.7.16-.2.31-.8 1.05-.98 1.26-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57a9.6 9.6 0 0 1-1.77-2.2c-.18-.32-.02-.5.13-.66.14-.14.32-.37.47-.55.16-.18.21-.31.32-.52.1-.21.05-.4-.03-.55-.08-.16-.7-1.68-.96-2.3-.25-.6-.5-.52-.7-.53h-.59c-.2 0-.52.08-.8.4-.27.31-1.05 1.03-1.05 2.52 0 1.48 1.08 2.92 1.23 3.12.16.21 2.13 3.26 5.16 4.57.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.9-.78 2.17-1.54.26-.76.26-1.42.18-1.55-.08-.13-.29-.2-.6-.36Z" />
  </svg>
);

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '254724471075'; // WhatsApp format: country code + number without +
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hello%20NetiaX%2C%20I%20would%20like%20to%20know%20more%20about%20your%20products%20and%20services.`;

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        aria-label="Open WhatsApp chat"
        title="Chat with us on WhatsApp"
      >
        <WhatsAppIcon />
      </button>

      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WhatsAppIcon className="h-5 w-5" />
              <div className="text-left">
                <h3 className="font-semibold text-sm">NetiaX Support</h3>
                <p className="text-xs text-green-100">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-green-600 rounded transition-colors"
              aria-label="Close WhatsApp chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message Area */}
          <div className="p-4 bg-gray-50 min-h-32 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="bg-green-100 text-green-900 rounded-lg p-3 text-sm">
                <p className="font-semibold mb-1">Welcome to NetiaX! 👋</p>
                <p>Hi there! How can we help you today? Feel free to ask about our products and services.</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
