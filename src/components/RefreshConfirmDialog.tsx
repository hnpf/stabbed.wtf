import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "./MaterialIcon";
import { Ripple } from "./Ripple";

export const RefreshConfirmDialog = ({ showRefreshConfirm, setShowRefreshConfirm }: any) => {
  return (
    <AnimatePresence>
      {showRefreshConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRefreshConfirm(false)}
            className="absolute inset-0 backdrop-blur-[10px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refresh-confirm-title"
            aria-describedby="refresh-confirm-description"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[var(--surface)] border-6 border-[var(--primary)] p-8 rounded-[2.5rem] shadow-2xl space-y-8"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[var(--primary-container)]/60 border border-[var(--primary)]/20 rounded-full flex items-center justify-center text-[var(--primary)] shadow-sm">
                <RefreshCw size={26} className="animate-spin-slow" />
              </div>
              <h3 id="refresh-confirm-title" className="text-3xl font-display font-black tracking-tight leading-tight">
                refresh required
              </h3>
              <p id="refresh-confirm-description" className="text-xl opacity-70 font-medium leading-relaxed">
                enabling/disabling this setting needs a refresh. do now?
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="m3-button-filled w-full h-16 !rounded-2xl text-[16px] font-black cursor-pointer"
              >
                <Ripple />
                <span className="relative z-[1]">yes, refresh now!</span>
              </button>
              <button
                onClick={() => setShowRefreshConfirm(false)}
                className="m3-button-tonal w-full h-16 !rounded-2xl text-[15px] font-bold opacity-60 hover:opacity-100 cursor-pointer"
              >
                <Ripple />
                <span className="relative z-[1]">no, later</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
