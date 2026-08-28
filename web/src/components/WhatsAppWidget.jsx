import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

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
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5" />
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
              <MessageCircle className="h-4 w-4" />
              Start Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
