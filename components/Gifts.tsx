"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const Gifts = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="gifts" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-[#5a2e2e] mb-6">Gifts</h2>
        <p className="text-gray-600 font-light mb-12 max-w-xl mx-auto">
          Your presence is the greatest gift of all. However, if you wish to honor us with a gift, a contribution towards our future would be deeply appreciated.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* PIX Card */}
          <motion.div 
            className="bg-[#fdf2f8] p-8 rounded-xl border-2 border-transparent hover:border-[#fbcfe8] transition-colors cursor-pointer group"
            onClick={() => copyToClipboard('48991149929', 'pix')}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
               {/* Simple Icon placeholder for Pix */}
               <div className="w-8 h-8 rounded bg-[#32BCAD] flex items-center justify-center text-white font-bold text-xs">PIX</div>
               <h3 className="text-xl font-bold text-[#5a2e2e]">Brazil (PIX)</h3>
            </div>
            <p className="text-[#8b4545] text-lg font-mono mb-2">(48) 991149929</p>
            <p className="text-sm text-gray-500">Gabriel Hertz Cabral</p>
            <div className="mt-4 text-xs uppercase tracking-widest text-[#32BCAD] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {copied === 'pix' ? <><Check className="w-3 h-3" /> Copied</> : 'Click to Copy'}
            </div>
          </motion.div>

          {/* Swish Card */}
          <motion.div 
            className="bg-[#fdf2f8] p-8 rounded-xl border-2 border-transparent hover:border-[#fbcfe8] transition-colors cursor-pointer group"
            onClick={() => copyToClipboard('0723006049', 'swish')}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
               {/* Simple Icon placeholder for Swish */}
               <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-[#E53D3D] font-bold overflow-hidden">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Swish_Logo.png/640px-Swish_Logo.png" alt="Swish" className="w-full h-full object-contain" />
               </div>
               <h3 className="text-xl font-bold text-[#5a2e2e]">Sweden (Swish)</h3>
            </div>
            <p className="text-[#8b4545] text-lg font-mono mb-2">072 300 60 49</p>
            <p className="text-sm text-gray-500">Raquel Gottfridsson</p>
            <div className="mt-4 text-xs uppercase tracking-widest text-[#E53D3D] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {copied === 'swish' ? <><Check className="w-3 h-3" /> Copied</> : 'Click to Copy'}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

