import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Ripple } from "./Ripple";

interface RippleScopeProps {
  children: React.ReactNode;
  enabled: boolean;
}

/**
 * Opt-in-at-the-app-level M3 state layers for ordinary interactive controls.
 *
 * The overlay is portalled into each control rather than around a navigation
 * group. This is important for animated navigation: every pill keeps its own
 * shape and stacking context.
 */
export function RippleScope({ children, enabled }: RippleScopeProps) {
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
    if (!enabled) return;
    const scope = scopeRef.current;
    if (!scope) return;

    const selector = [
      "button:not([disabled])",
      "a[href]",
      "label:has(.m3-switch)",
      '[role="button"]:not([aria-disabled="true"])',
      "[data-ripple]",
    ].join(",");

    const syncTargets = () => {
      const next = Array.from(scope.querySelectorAll(selector)).filter(
        (target): target is HTMLElement =>
          target instanceof HTMLElement &&
          !target.closest(".m3-ripple-container") &&
          !target.querySelector(
            '.m3-ripple-container:not([data-m3-ripple-scope])',
          ) &&
          !target.closest("[data-ripple-skip]") &&
          !target.hasAttribute("disabled"),
      );
      next.forEach((target) => {
        target.setAttribute("data-m3-ripple-target", "");
        if (window.getComputedStyle(target).position === "static") {
          target.setAttribute("data-m3-ripple-positioned", "");
        } else {
          target.removeAttribute("data-m3-ripple-positioned");
        }
      });
      setTargets((current) => {
        const nextSet = new Set(next);
        current
          .filter((target) => !nextSet.has(target))
          .forEach((target) => {
            target.removeAttribute("data-m3-ripple-target");
            target.removeAttribute("data-m3-ripple-positioned");
          });
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
      targets.forEach((target) => {
        target.removeAttribute("data-m3-ripple-target");
        target.removeAttribute("data-m3-ripple-positioned");
      });
    };
  }, [enabled]);

  return (
    <div ref={scopeRef} className="contents">
      {children}
      {enabled && targets.map((target) =>
        createPortal(<Ripple target={target} enableHaptics={false} />, target, getTargetKey(target)),
      )}
    </div>
  );
}
