import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, AlertTriangle, Home } from '../components/MaterialIcon';

// might be worth adding a search box here at some point but maybe useless??
const NotFound = ({ go }: { go?: (page: string) => void }) => {
  // read once, never changes, no need for state
  const missing = (() => {
    try { return new URLSearchParams(window.location.search).get('missing'); }
    catch { return null; }
  })();

  return (
    <div className="flex flex-col min-h-[85vh] w-full text-center relative overflow-hidden rounded-[4rem] bg-[var(--surface)] p-8 md:p-16 border-6 border-[var(--outline-variant)]/30">
      {/* bg 404 pushed up on mobile to avoid overlapping the text */}
      <div className="absolute inset-0 flex items-start justify-center pt-32 md:items-center md:pt-0 pointer-events-none select-none overflow-hidden">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 0.05, scale: 1, rotate: -2 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[10rem] sm:text-[15rem] md:text-[20rem] lg:text-[30rem] xl:text-[35rem] font-expressive font-black tracking-tighter leading-none italic"
        >
          404
        </motion.h1>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between h-full flex-1 w-full max-w-6xl mx-auto gap-16 md:gap-0">
        {/* little floating banner at the top */}
        <motion.div
          whileHover={{ scale: 1.02, y: -10 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }} 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 md:mt-0"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-[var(--surface-variant)]/60 backdrop-blur-xl text-[var(--primary)] shadow-2xl border-4 border-[var(--outline-variant)]/50 group cursor-default">
            <AlertTriangle className="w-6 h-6 md:w-10 md:h-10 shrink-0 opacity-80 transition-transform duration-500" strokeWidth={1.5} />
            <span className="text-[14px] md:text-xl font-expressive font-black tracking-[0.2em] opacity-80 border-l-4 border-[var(--outline-variant)] pl-6 italic">
              how did we get here?
            </span>
          </div>
        </motion.div>

        {/* actual error text */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="py-6 md:py-0 space-y-8"
        >
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] font-expressive font-black tracking-tighter mb-8 text-balance leading-[0.8] italic">
            This link doesn't exist.
          </h2>
          <p className="text-xl md:text-3xl text-[var(--on-surface-variant)] opacity-50 font-medium max-w-2xl mx-auto leading-tight px-6 text-pretty italic">
            {missing 
              ? `/${missing} is missing to our knowledge.`
              : `That link doesn't exist here, sorry :(`}
          </p>
        </motion.div>

        {/* buttons */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.33, 1, 0.68, 1] }}
          className="w-full flex flex-col sm:flex-row gap-6 justify-center items-center pb-12 md:pb-0"
        >
          <motion.button 
            whileHover={{ scale: 1.02, y: -10 }}
            transition={{ duration: 0.05, ease: [0.33, 1, 0.68, 1] }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => window.history.back()}
            className="w-full sm:w-80 py-6 md:py-10 rounded-[2.5rem] font-expressive font-black text-xl md:text-3xl bg-[var(--surface-variant)] text-[var(--on-surface-variant)] border-4 border-[var(--outline-variant)] flex items-center justify-center gap-4 transition-all hover:bg-[var(--primary-container)] hover:text-[var(--on-primary-container)] hover:border-[var(--primary)]/30 group shadow-xl"
          >
            <ArrowLeft className="w-6 h-6 md:w-10 md:h-10 group-hover:-translate-x-3 transition-transform duration-500" />
            <span className="italic tracking-tighter">Return</span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => go?.('home')}
            className="w-full sm:w-80 py-6 md:py-10 rounded-[2.5rem] font-expressive font-black text-xl md:text-3xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center gap-4 group"
          >
            <span className="italic tracking-tighter">Go Home</span>
            <Home className="w-6 h-6 md:w-10 md:h-10 group-hover:scale-125 transition-transform duration-500" />
          </motion.button>
        </motion.div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-20" />
    </div>
  );
};

export default NotFound;
