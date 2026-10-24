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
  const [panY, setPanY] = useState<number>(0);
  const [viewportWidth, setViewportWidth] = useState<number>(window.innerWidth);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Synchronous refs to prevent stale closures and avoid re-creating callbacks on every frame
  const pixelsPerYearRef = useRef<number>(pixelsPerYear);
  const panXRef = useRef<number>(panX);
  const panYRef = useRef<number>(panY);
  const viewportWidthRef = useRef<number>(viewportWidth);
  const hasInitializedRef = useRef<boolean>(false);

  pixelsPerYearRef.current = pixelsPerYear;
  panXRef.current = panX;
  panYRef.current = panY;
  viewportWidthRef.current = viewportWidth;

  const dragStartRef = useRef<{ startX: number; startY: number; startPanX: number; startPanY: number }>({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const animFrameRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const pinchStartRef = useRef<{ dist: number; zoom: number; panX: number; centerClientX: number } | null>(null);

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

  // Pointer drag panning & mobile pinch zoom
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Ignore if clicking on button or interactive elements
      const target = e.target as HTMLElement;
      if (target.closest('button, input, a, select, textarea, [data-interactive="true"]')) {
        return;
      }

      activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      if (activePointersRef.current.size === 1) {
        setIsDragging(true);
        dragStartRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startPanX: panXRef.current,
          startPanY: panYRef.current,
        };
      } else if (activePointersRef.current.size === 2) {
        // Multi-touch pinch-to-zoom started
        setIsDragging(false);
        const pts = Array.from(activePointersRef.current.values());
        const dist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
        pinchStartRef.current = {
          dist: Math.max(dist, 1),
          zoom: pixelsPerYearRef.current,
          panX: panXRef.current,
          centerClientX: (pts[0].clientX + pts[1].clientX) / 2,
        };
      }
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!activePointersRef.current.has(e.pointerId)) return;
      activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      // Two fingers: Pinch-to-zoom
      if (activePointersRef.current.size === 2 && pinchStartRef.current) {
        const pts = Array.from(activePointersRef.current.values());
        const currentDist = Math.hypot(pts[0].clientX - pts[1].clientX, pts[0].clientY - pts[1].clientY);
        const scale = currentDist / pinchStartRef.current.dist;

        const newZoom = Math.max(
          DEFAULT_MIN_ZOOM,
          Math.min(DEFAULT_MAX_ZOOM, pinchStartRef.current.zoom * scale)
        );

        const rect = containerRef.current?.getBoundingClientRect();
        const screenX = pinchStartRef.current.centerClientX - (rect?.left || 0);
        const newPanX = calculateZoomAtPoint(screenX, pinchStartRef.current.zoom, newZoom, pinchStartRef.current.panX);
        setPixelsPerYear(newZoom);
        setPanX(newPanX);
        return;
      }

      // One finger: Pan drag (2D: horizontal & vertical)
      if (isDragging && activePointersRef.current.size === 1) {
        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;
        setPanX(dragStartRef.current.startPanX - deltaX);

        // Vertical panning with smooth bounds so user can comfortably inspect top/bottom zones
        const maxPanY = 320;
        const newPanY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.startPanY + deltaY));
        setPanY(newPanY);
      }
    },
    [isDragging, containerRef]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }

    if (activePointersRef.current.size === 1) {
      // Switch back to single-finger dragging for remaining touch point
      const remaining = Array.from(activePointersRef.current.values())[0];
      dragStartRef.current = {
        startX: remaining.clientX,
        startY: remaining.clientY,
        startPanX: panXRef.current,
        startPanY: panYRef.current,
      };
      setIsDragging(true);
    } else if (activePointersRef.current.size === 0) {
      setIsDragging(false);
    }

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  }, []);

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
    setPanY(0);
  }, []);

  return {
    pixelsPerYear,
    panX,
    panY,
    setPanY,
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
