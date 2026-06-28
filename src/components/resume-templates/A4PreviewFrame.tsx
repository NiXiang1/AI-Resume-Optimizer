"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type A4PreviewFrameProps = {
  children: ReactNode;
  className?: string;
};

const A4_HEIGHT_MM = 297;
const OVERFLOW_TOLERANCE_PX = 2;

export default function A4PreviewFrame({ children, className = "" }: A4PreviewFrameProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) {
      return;
    }

    let frameId = 0;

    const checkOverflow = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const page = paper.firstElementChild instanceof HTMLElement ? paper.firstElementChild : paper;
        const actualHeight = Math.max(page.getBoundingClientRect().height, page.scrollHeight);
        const a4Height = measureMillimeters(A4_HEIGHT_MM);
        setIsOverflowing(actualHeight > a4Height + OVERFLOW_TOLERANCE_PX);
      });
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(paper);

    if (paper.firstElementChild instanceof HTMLElement) {
      observer.observe(paper.firstElementChild);
    }

    window.addEventListener("resize", checkOverflow);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [children]);

  return (
    <div className={`a4-preview-frame ${className}`.trim()}>
      {isOverflowing ? (
        <div className="a4-preview-warning" role="status">
          当前内容已超过一页，建议精简或导出为多页 PDF。
        </div>
      ) : null}

      <div className="a4-preview-paper" ref={paperRef}>
        {children}
      </div>
    </div>
  );
}

function measureMillimeters(mm: number) {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.height = `${mm}mm`;
  probe.style.width = "1px";
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}
