"use client";

import { createPortal } from "react-dom";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#131313] border border-white/10 rounded-2xl p-6 md:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-[#ffb4ab] mb-6">
          Privacy Policy
        </h2>
        
        <div className="space-y-6 text-on-surface-variant text-sm font-sora leading-relaxed">
          <section>
            <h3 className="text-white font-bold mb-2">1. Data Collection</h3>
            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, and in-game ID.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">2. How We Use Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, such as to facilitate match tracking, process prize payouts, and authenticate users.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">3. Information Sharing</h3>
            <p>We may share your information with our partners for the purpose of facilitating the tournaments and payouts. We do not sell your personal data to third parties.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2">4. Security</h3>
            <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">5. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at support@titanarena.com.</p>
          </section>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose}
            className="font-orbitron text-xs font-bold text-white uppercase tracking-wider bg-crimson px-6 py-3 rounded-md hover:bg-crimson/90 active:scale-95 transition-all duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
