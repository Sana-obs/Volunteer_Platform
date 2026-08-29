

import { useLayoutEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

const DEFAULT_THRESHOLD = 40;
const DEFAULT_OVERSCAN = 2;
const DEFAULT_GAP = 24; // matches Tailwind gap-6 (1.5rem)

const DEFAULT_BREAKPOINTS = [
  { minWidth: 1280, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

/**
  * @param {number} width
 * @param {Array<{minWidth:number, columns:number}>} [breakpoints]
 */
export function getColumnsForWidth(width, breakpoints = DEFAULT_BREAKPOINTS) {
  const match = breakpoints.find((breakpoint) => width >= breakpoint.minWidth);
  return match ? match.columns : 1;
}

export function shouldVirtualize(itemCount, threshold = DEFAULT_THRESHOLD) {
  return itemCount > threshold;
}

/**
 * @param {Object} params
 * @param {Array} params.items 
 * @param {number} params.estimateRowHeight 
  * @param {number} [params.threshold]
 * @param {number} [params.overscan] 
 * @param {number} [params.gap] 
 * @param {Array<{minWidth:number, columns:number}>} [params.breakpoints]
 */
export function useVirtualizedGrid({
  items,
  estimateRowHeight,
  threshold = DEFAULT_THRESHOLD,
  overscan = DEFAULT_OVERSCAN,
  gap = DEFAULT_GAP,
  breakpoints = DEFAULT_BREAKPOINTS,
}) {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState(() => getColumnsForWidth(window.innerWidth, breakpoints));
  const [scrollMargin, setScrollMargin] = useState(0);

   useLayoutEffect(() => {
    function syncLayout() {
      setColumns(getColumnsForWidth(window.innerWidth, breakpoints));
      if (containerRef.current) setScrollMargin(containerRef.current.offsetTop);
    }
    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, [breakpoints]);

  const isVirtualized = shouldVirtualize(items.length, threshold);
  const rowCount = isVirtualized ? Math.ceil(items.length / columns) : 0;

  const rowVirtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight,
    overscan,
    gap,
    scrollMargin,
    enabled: isVirtualized,
  });

  const virtualRows = isVirtualized
    ? rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const startIndex = virtualRow.index * columns;
        return {
          key: virtualRow.key,
          index: virtualRow.index,
          startIndex,
          start: virtualRow.start - scrollMargin,
          items: items.slice(startIndex, startIndex + columns),
      
          measureRef: (node) => {
            if (!node) return;
            node.setAttribute("data-index", String(virtualRow.index));
            rowVirtualizer.measureElement(node);
          },
        };
      })
    : [];

  return {
    containerRef,
    isVirtualized,
    columns,
    totalSize: isVirtualized ? rowVirtualizer.getTotalSize() - scrollMargin : 0,
    virtualRows,
  };
}
