import React, { memo } from "react";
import { motion } from "motion/react";
import { CHANGELOGS } from "../constants";

export const ChangelogPage = memo(() => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 px-4 md:px-0 mb-32">
      <header className="page-header space-y-4">
        <h2 className="page-title tracking-[0.01em] italic">Changelog</h2>
        <p className="text-2xl opacity-60 font-medium">
          Tracking virex changes.
        </p>
      </header>

      <div className="space-y-24">
        {CHANGELOGS.map((entry, i) => (
          <motion.section
            key={entry.id}
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-12 border-l-2 border-[var(--outline-variant)]  r"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-full text-xs font-black tracking-widest uppercase">
                    v{entry.version}
                  </span>
                  <span className="text-sm font-bold opacity-40 uppercase tracking-widest">
                    {entry.date}
                  </span>
                </div>
                <h3 className="text-4xl font-display font-black tracking-tight">
                  {entry.title}
                </h3>
              </div>

              <div className="columns-1 md:columns-2 gap-8 space-y-8 md:space-y-0">
                {entry.changes.map((group) => (
                  <div key={group.category} className="break-inside-avoid space-y-4 mb-8">
                    <h4 className="text-[13px] font-black tracking-[0.1em] opacity-40 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      {group.category}
                    </h4>
                    <ul className="space-y-3">
                      {group.items.map((item, index) => (
                        <li
                          key={index}
                          className="text-lg opacity-80 leading-relaxed flex gap-3"
                        >
                          <span className="text-[var(--primary)] font-bold mt-1">
                            /
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
});
