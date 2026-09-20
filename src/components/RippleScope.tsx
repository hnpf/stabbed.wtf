import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ripple } from "./Ripple";

/**
 * Opt-in-at-the-app-level M3 state layers for ordinary interactive controls.
 *
 * The overlay is portalled into each control rather than around a navigation
 * group. This is important for animated navigation: every pill keeps its own
 * shape and stacking context.
 */
export function RippleScope({ children }: { children: React.ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState<HTMLElement[]>([]);
  const targetKeys = useRef(new WeakMap<HTMLElement, string>());
  const nextTargetKey = useRef(0);

  const getTargetKey = (target: HTMLElement) => {
    let key = targetKeys.current.get(target);
    if (!key) {
      key = `m3-ripple-${nextTargetKey.current++}`;
      targetKeys.current.set(target, key);
    }
    return key;
  };

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const selector = [
      "button:not([disabled])",
      "a[href]",
      '[role="button"]:not([aria-disabled="true"])',
      "[data-ripple]",
    ].join(",");

    const syncTargets = () => {
      const next = Array.from(scope.querySelectorAll(selector)).filter(
        (target): target is HTMLElement =>
          target instanceof HTMLElement &&
          !target.closest(".m3-ripple-container") &&
          !target.closest("[data-ripple-skip]") &&
          !target.hasAttribute("disabled"),
      );
      next.forEach((target) => {
        target.classList.add("m3-ripple-target");
        target.classList.toggle(
          "m3-ripple-target--positioned",
          window.getComputedStyle(target).position === "static",
        );
      });
      setTargets((current) => {
        const nextSet = new Set(next);
        current
          .filter((target) => !nextSet.has(target))
          .forEach((target) => target.classList.remove("m3-ripple-target", "m3-ripple-target--positioned"));
        return current.length === next.length && current.every((target, index) => target === next[index])
          ? current
          : next;
      });
    };

    syncTargets();
    const observer = new MutationObserver(syncTargets);
    observer.observe(scope, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled", "role", "href", "data-ripple", "data-ripple-skip"] });
    return () => {
      observer.disconnect();
      targets.forEach((target) => target.classList.remove("m3-ripple-target", "m3-ripple-target--positioned"));
    };
  }, []);

  return (
    <div ref={scopeRef} className="contents">
      {children}
      {targets.map((target) =>
        createPortal(<Ripple enableHaptics={false} />, target, getTargetKey(target)),
      )}
    </div>
  );
}
