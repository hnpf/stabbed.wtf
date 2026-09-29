// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from "react";

export interface TextSearchState {
  query: string;
  isOpen: boolean;
  matchCount: number;
  currentMatch: number;
}

export function useTextSearch() {
  const [searchState, setSearchState] = useState<TextSearchState>({
    query: "",
    isOpen: false,
    matchCount: 0,
    currentMatch: 0,
  });

  const activeMatchRef = useRef<HTMLElement | null>(null);

  const getMatchElements = () => {
    const mainContent = document.querySelector("main") || document.body;
    return Array.from(mainContent.querySelectorAll("mark[data-search-match]")) as HTMLElement[];
  };

  const scrollToMatch = useCallback((index: number) => {
    const matches = getMatchElements();
    if (matches.length === 0) return;

    const normalizedIndex = Math.min(Math.max(index - 1, 0), matches.length - 1);
    const target = matches[normalizedIndex];
    if (!target) return;

    // secondary matches
    matches.forEach((match) => {
        match.style.boxShadow = "none";
        match.style.padding = "2px 4px";
        match.style.backgroundColor = "rgba(236, 72, 153, 0.35)"; // pink-500
        match.style.color = "inherit";
    });

    // active match
    target.style.backgroundColor = "rgba(244, 114, 182, 0.85)"; // pink-400
    target.style.color = "#000000";
    target.style.boxShadow = "0 0 0 2px #ec4899";
    target.style.padding = "2px 4px";
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
    activeMatchRef.current = target;
  }, []);

  // remove all highlights from the page
  const clearHighlights = useCallback(() => {
    getMatchElements().forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        mark.replaceWith(document.createTextNode(mark.textContent || ""));
        parent.normalize();
      }
    });
    activeMatchRef.current = null;
  }, []);

  // highlight all matches of the search query
  const highlightMatches = useCallback((query: string) => {
    clearHighlights();

    if (!query.trim()) {
      setSearchState((prev: TextSearchState) => ({ ...prev, matchCount: 0, currentMatch: 0 }));
      return;
    }

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const mainContent = document.querySelector("main") || document.body;
    const walker = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, style, code, input, textarea, select, [contenteditable='true']")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const textNodes: Text[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      const matches = Array.from(text.matchAll(regex));
      if (matches.length === 0 || !textNode.parentNode) return;

      const fragment = document.createDocumentFragment();
      let offset = 0;
      matches.forEach((match) => {
        const start = match.index ?? offset;
        if (start > offset) fragment.append(document.createTextNode(text.slice(offset, start)));
        const mark = document.createElement("mark");
        mark.dataset.searchMatch = "true";
        mark.textContent = match[0];
        mark.style.cssText = "background-color: rgba(245, 158, 11, 0.4); color: #000000; border-radius: 4px; padding: 2px 4px;";
        fragment.append(mark);
        offset = start + match[0].length;
      });
      if (offset < text.length) fragment.append(document.createTextNode(text.slice(offset)));
      textNode.replaceWith(fragment);
    });

    const effectiveCount = getMatchElements().length;
    setSearchState((prev: TextSearchState) => ({
      ...prev,
      matchCount: effectiveCount,
      currentMatch: effectiveCount > 0 ? 1 : 0,
    }));

    if (effectiveCount > 0) {
      scrollToMatch(1);
    }
  }, [clearHighlights, scrollToMatch]);

  const toggleSearch = useCallback(() => {
    setSearchState((prev: TextSearchState) => ({
      ...prev,
      isOpen: !prev.isOpen,
      query: "",
    }));
    clearHighlights();
  }, [clearHighlights]);

  const updateQuery = useCallback(
    (query: string) => {
      setSearchState((prev: TextSearchState) => ({
        ...prev,
        query,
        currentMatch: 0,
      }));
      highlightMatches(query);
    },
    [highlightMatches]
  );

  const navigateMatch = useCallback((change: number) => {
    setSearchState((prev: TextSearchState) => {
      const total = prev.matchCount;
      if (total === 0) return prev;
      let next = prev.currentMatch + change;
      if (next < 1) next = total;
      if (next > total) next = 1;
      scrollToMatch(next);
      return { ...prev, currentMatch: next };
    });
  }, [scrollToMatch]);

  const nextMatch = useCallback(() => navigateMatch(1), [navigateMatch]);
  const prevMatch = useCallback(() => navigateMatch(-1), [navigateMatch]);

  const closeSearch = useCallback(() => {
    setSearchState((prev: TextSearchState) => ({
      ...prev,
      isOpen: false,
      query: "",
    }));
    clearHighlights();
  }, [clearHighlights]);

  // setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ctrl+f or cmd+f to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        if (!searchState.isOpen) {
          toggleSearch();
        }
      }

      if (!searchState.isOpen) return;

      // navigate matches
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          prevMatch();
        } else {
          nextMatch();
        }
      }

      if (e.key === "F3") {
        e.preventDefault();
        if (e.shiftKey) {
          prevMatch();
        } else {
          nextMatch();
        }
      }

      // escape to close search
      if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchState.isOpen, toggleSearch, closeSearch, nextMatch, prevMatch]);

  return {
    ...searchState,
    updateQuery,
    toggleSearch,
    closeSearch,
    clearHighlights,
    nextMatch,
    prevMatch,
  };
}
