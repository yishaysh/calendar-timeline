import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  MAX_YEAR,
  calculateZoomAtPoint,
} from '../engine/coordinates';

interface UseTimelinePanZoomOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  initialYear?: number;
}

export function useTimelinePanZoom({ containerRef, initialYear = 3760 }: UseTimelinePanZoomOptions) {
  const [pixelsPerYear, setPixelsPerYear] = useState<number>(0.35);
  const [panX, setPanX] = useState<number>(0);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Synchronous refs to prevent stale closures and avoid re-creating callbacks on every frame
  const pixelsPerYearRef = useRef<number>(pixelsPerYear);
  const panXRef = useRef<number>(panX);
  const viewportWidthRef = useRef<number>(viewportWidth);
  const hasInitializedRef = useRef<boolean>(false);

  pixelsPerYearRef.current = pixelsPerYear;
  panXRef.current = panX;
  viewportWidthRef.current = viewportWidth;

  const dragStartRef = useRef<{ startX: number; startPanX: number }>({ startX: 0, startPanX: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      } else {
        setViewportWidth(window.innerWidth);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  // Initial centering (runs once when container is sized)
  useEffect(() => {
    if (viewportWidth > 0 && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Fit 6000 years with margin
      const fitZoom = Math.max(DEFAULT_MIN_ZOOM, (viewportWidth - 80) / MAX_YEAR);
      setPixelsPerYear(fitZoom);

      // Center around year 3760 (or initialYear)
      const worldX = (MAX_YEAR - initialYear) * fitZoom;
      setPanX(worldX - viewportWidth / 2);
    }
  }, [viewportWidth, initialYear]);

  // Imperative non-passive wheel zoom listener on container
  // Fixes: "Unable to preventDefault inside passive event listener invocation"
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const currentZoom = pixelsPerYearRef.current;
      const currentPanX = panXRef.current;

      const newZoom = Math.max(
        DEFAULT_MIN_ZOOM,
        Math.min(DEFAULT_MAX_ZOOM, currentZoom * zoomFactor)
      );

      const newPanX = calculateZoomAtPoint(cursorX, currentZoom, newZoom, currentPanX);
      setPixelsPerYear(newZoom);
      setPanX(newPanX);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, [containerRef]);

  // Pointer drag panning
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore if clicking on button or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, input, a, select, textarea, [data-interactive="true"]')) {
        return;
      }

      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startPanX: panXRef.current,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      // Invert delta: dragging right moves view to earlier years (towards right in RTL)
      setPanX(dragStartRef.current.startPanX - deltaX);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }, [isDragging]);

  // Smooth animation to fly to a specific year
  // STABLE identity: [] dependencies, reads from refs to prevent re-render loops
  const flyToYear = useCallback(
    (targetYear: number, targetZoom?: number) => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      const startZoom = pixelsPerYearRef.current;
      const startPanX = panXRef.current;
      const vWidth = viewportWidthRef.current;

      const endZoom = targetZoom
        ? Math.max(DEFAULT_MIN_ZOOM, Math.min(DEFAULT_MAX_ZOOM, targetZoom))
        : Math.max(startZoom, 3.5); // Ensure enough zoom to see details

      const targetWorldX = (MAX_YEAR - targetYear) * endZoom;
      const endPanX = targetWorldX - vWidth / 2;

      const startTime = performance.now();
      const duration = 650; // ms

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth easeOutCubic
        const ease = 1 - Math.pow(1 - progress, 3);

        const currentZoom = startZoom + (endZoom - startZoom) * ease;
        const currentPanX = startPanX + (endPanX - startPanX) * ease;

        setPixelsPerYear(currentZoom);
        setPanX(currentPanX);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    },
    []
  );

  // Manual zoom controls (stable identity)
  const zoomIn = useCallback(() => {
    const currentZoom = pixelsPerYearRef.current;
    const currentPanX = panXRef.current;
    const centerScreenX = viewportWidthRef.current / 2;
    const newZoom = Math.min(DEFAULT_MAX_ZOOM, currentZoom * 1.35);
    const newPanX = calculateZoomAtPoint(centerScreenX, currentZoom, newZoom, currentPanX);
    setPixelsPerYear(newZoom);
    setPanX(newPanX);
  }, []);

  const zoomOut = useCallback(() => {
    const currentZoom = pixelsPerYearRef.current;
    const currentPanX = panXRef.current;
    const centerScreenX = viewportWidthRef.current / 2;
    const newZoom = Math.max(DEFAULT_MIN_ZOOM, currentZoom / 1.35);
    const newPanX = calculateZoomAtPoint(centerScreenX, currentZoom, newZoom, currentPanX);
    setPixelsPerYear(newZoom);
    setPanX(newPanX);
  }, []);

  const resetView = useCallback(() => {
    const vWidth = viewportWidthRef.current;
    const fitZoom = Math.max(DEFAULT_MIN_ZOOM, (vWidth - 100) / MAX_YEAR);
    setPixelsPerYear(fitZoom);
    setPanX(-50);
  }, []);

  return {
    pixelsPerYear,
    panX,
    viewportWidth,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    zoomIn,
    zoomOut,
    resetView,
    flyToYear,
  };
}
