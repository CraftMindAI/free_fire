"use client";

import { createPortal } from "react-dom";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
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
          Terms of Service
        </h2>
        
        <div className="space-y-6 text-on-surface-variant text-sm font-sora leading-relaxed">
          <section>
            <h3 className="text-white font-bold mb-2">1. Acceptance of Terms</h3>
            <p>By accessing and using Titan Arena, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">2. User Accounts</h3>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account and password. Titan Arena is not liable for any loss or damage arising from your failure to protect your login credentials.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">3. Fair Play & Anti-Cheat</h3>
            <p>All players must adhere to fair play guidelines. The use of third-party software, exploits, or hacks will result in an immediate permanent ban and forfeiture of all accumulated rewards or winnings. Our team actively monitors matches.</p>
          </section>
          
          <section>
            <h3 className="text-white font-bold mb-2">4. Payouts and Rewards</h3>
            <p>All cash rewards will be processed within the stipulated timeframe. Titan Arena reserves the right to withhold payouts if suspicious activity or rule violations are detected during the gameplay.</p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-2">5. Modifications to Service</h3>
            <p>We reserve the right to modify or discontinue the service with or without notice to the user. We shall not be liable to you or any third party should we exercise our right to modify or discontinue the service.</p>
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
