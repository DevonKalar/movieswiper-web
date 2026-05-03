import { useState, useEffect, useRef, useCallback } from "react";

const AXIS_THRESHOLD = 10;
const SWIPE_THRESHOLD = 50;
const ANIMATION_DURATION = 300;

export const useCardGestures = (onSwipe, onNavigate, { onVerticalDrag } = {}) => {
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [navDirection, setNavDirection] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const axisRef = useRef(null);
  const committedDirectionRef = useRef(null);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef(null);

  const processGesture = useCallback((direction) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Deck-managed vertical: fire immediately, no card-level exit animation
    if (axisRef.current === 'vertical' && onVerticalDrag) {
      onNavigate(direction);
      setCurrentX(0); setCurrentY(0);
      setSwipeDirection(null); setNavDirection(null); setIsExiting(false); setIsDragging(false);
      axisRef.current = null;
      committedDirectionRef.current = null;
      isProcessingRef.current = false;
      return;
    }

    if (axisRef.current === 'vertical') {
      setIsExiting(true);
      setCurrentY(direction === 'up' ? -window.innerHeight : window.innerHeight);
    }

    timeoutRef.current = setTimeout(() => {
      if (axisRef.current === 'horizontal') {
        onSwipe(direction);
      } else {
        onNavigate(direction);
      }
      setCurrentX(0);
      setCurrentY(0);
      setSwipeDirection(null);
      setNavDirection(null);
      setIsExiting(false);
      axisRef.current = null;
      committedDirectionRef.current = null;
      isProcessingRef.current = false;
      timeoutRef.current = null;
    }, ANIMATION_DURATION);
  }, [onSwipe, onNavigate, onVerticalDrag]);

  const handleDragStart = useCallback((e) => {
    if (isProcessingRef.current) return;
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    startXRef.current = clientX;
    startYRef.current = clientY;
    axisRef.current = null;
    committedDirectionRef.current = null;
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!isDragging || isProcessingRef.current) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const diffX = clientX - startXRef.current;
    const diffY = clientY - startYRef.current;

    if (!axisRef.current) {
      if (Math.abs(diffX) > AXIS_THRESHOLD || Math.abs(diffY) > AXIS_THRESHOLD) {
        axisRef.current = Math.abs(diffX) >= Math.abs(diffY) ? 'horizontal' : 'vertical';
      }
      return;
    }

    if (axisRef.current === 'horizontal') {
      setCurrentX(diffX);
      if (Math.abs(diffX) >= SWIPE_THRESHOLD) {
        const dir = diffX > 0 ? 'right' : 'left';
        committedDirectionRef.current = dir;
        setSwipeDirection(dir);
      } else {
        committedDirectionRef.current = null;
        setSwipeDirection(null);
      }
    } else {
      if (onVerticalDrag) {
        onVerticalDrag(diffY);
      } else {
        setCurrentY(diffY);
      }
      if (Math.abs(diffY) >= SWIPE_THRESHOLD) {
        const dir = diffY > 0 ? 'down' : 'up';
        committedDirectionRef.current = dir;
        setNavDirection(dir);
      } else {
        committedDirectionRef.current = null;
        setNavDirection(null);
      }
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const direction = committedDirectionRef.current;
    if (direction) {
      processGesture(direction);
    } else {
      if (axisRef.current === 'vertical' && onVerticalDrag) {
        onVerticalDrag(null); // signal snap-back to parent
      }
      setCurrentX(0);
      setCurrentY(0);
      setSwipeDirection(null);
      setNavDirection(null);
      axisRef.current = null;
    }
  }, [processGesture, onVerticalDrag]);

  useEffect(() => {
    if (!isDragging) return;
    const controller = new AbortController();
    window.addEventListener('mousemove', handleDragMove, { signal: controller.signal });
    window.addEventListener('mouseup', handleDragEnd, { signal: controller.signal });
    window.addEventListener('touchmove', handleDragMove, { signal: controller.signal, passive: true });
    window.addEventListener('touchend', handleDragEnd, { signal: controller.signal });
    return () => controller.abort();
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Called by parent (action buttons) — shows overlay + animates card exit.
  // Does NOT call onSwipe; the parent handles like/reject logic directly.
  const triggerSwipe = useCallback((direction) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    axisRef.current = 'horizontal';
    setSwipeDirection(direction);
    setCurrentX(direction === 'right' ? 500 : -500);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrentX(0);
      setCurrentY(0);
      setSwipeDirection(null);
      setNavDirection(null);
      setIsExiting(false);
      axisRef.current = null;
      committedDirectionRef.current = null;
      isProcessingRef.current = false;
      timeoutRef.current = null;
    }, ANIMATION_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const transform = (() => {
    if (!onVerticalDrag && (axisRef.current === 'vertical' || isExiting)) {
      return `translateY(${currentY}px)`;
    }
    const rotation = Math.sign(currentX) * Math.min(Math.abs(currentX * 0.05), 15);
    return `translateX(${currentX}px) rotate(${rotation}deg)`;
  })();

  return {
    transform,
    isDragging,
    swipeDirection,
    navDirection,
    isProcessingSwipe: isProcessingRef.current,
    isExiting,
    gestureHandlers: {
      onMouseDown: handleDragStart,
      onTouchStart: handleDragStart,
    },
    triggerSwipe,
  };
};
