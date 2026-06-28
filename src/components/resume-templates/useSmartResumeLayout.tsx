"use client";

import { useCallback, useLayoutEffect, useState } from "react";

type SmartLayoutMode = "comfortable" | "compact" | "overflow";

const compactThreshold = 0.94;
const overflowThreshold = 1.01;
const relaxThreshold = 0.82;

export function useSmartResumeLayout() {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<SmartLayoutMode>("comfortable");

  const rootRef = useCallback((node: HTMLElement | null) => {
    setElement(node);
  }, []);

  useLayoutEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    let animationFrame = 0;

    const measure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const styles = window.getComputedStyle(element);
        const targetHeight = Number.parseFloat(styles.minHeight) || element.clientHeight;
        const contentHeight = element.scrollHeight;
        const ratio = targetHeight > 0 ? contentHeight / targetHeight : 0;

        setMode((currentMode) => {
          if (currentMode === "comfortable" && ratio >= compactThreshold) {
            return "compact";
          }

          if (currentMode === "compact" && ratio > overflowThreshold) {
            return "overflow";
          }

          if (currentMode === "overflow" && ratio <= overflowThreshold) {
            return "compact";
          }

          if (currentMode !== "comfortable" && ratio < relaxThreshold) {
            return "comfortable";
          }

          return currentMode;
        });
      });
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [element]);

  return [rootRef, `resume-layout-${mode}`, mode === "overflow"] as const;
}

export function ResumeOverflowHint() {
  return (
    <div className="resume-overflow-hint" role="status">
      内容已超过一页，建议精简内容或导出多页 PDF。
    </div>
  );
}
