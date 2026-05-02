import { useState, useEffect, useRef } from "react";

const RangeSlider = ({ min, max, step, value, onChange, label }) => {
  const [localRange, setLocalRange] = useState({ min: value.min, max: value.max });
  const [isDragging, setIsDragging] = useState(null); // 'min' | 'max' | null
  const trackRef = useRef(null);

  // Sync with external value changes
  useEffect(() => {
    setLocalRange({ min: value.min, max: value.max });
  }, [value]);

  // Calculate positions as percentages
  const minPosition = ((localRange.min - min) / (max - min)) * 100;
  const maxPosition = ((localRange.max - min) / (max - min)) * 100;

  const calculateValueFromPosition = (clientX) => {
    if (!trackRef.current) return null;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const rawValue = (percentage / 100) * (max - min) + min;
    return Math.round(rawValue / step) * step;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    // Get clientX from either mouse or touch event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newValue = calculateValueFromPosition(clientX);
    if (newValue === null) return;

    if (isDragging === 'min') {
      const clampedMin = Math.max(min, Math.min(newValue, localRange.max, max - 1));
      const newRange = { ...localRange, min: clampedMin };
      setLocalRange(newRange);
      onChange(newRange);
    } else if (isDragging === 'max') {
      const clampedMax = Math.min(max, Math.max(newValue, localRange.min, min + 1));
      const newRange = { ...localRange, max: clampedMax };
      setLocalRange(newRange);
      onChange(newRange);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      const controller = new AbortController();
      
      document.addEventListener('mousemove', handleMouseMove, { signal: controller.signal });
      document.addEventListener('mouseup', handleMouseUp, { signal: controller.signal });
      document.addEventListener('touchmove', handleMouseMove, { signal: controller.signal });
      document.addEventListener('touchend', handleMouseUp, { signal: controller.signal });

      return () => {
        controller.abort();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, localRange]);

  const handleKeyDown = (handle, e) => {
    let newValue;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = handle === 'min' 
          ? Math.min(localRange.min + step, localRange.max, max)
          : Math.min(localRange.max + step, max);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = handle === 'min'
          ? Math.max(localRange.min - step, min)
          : Math.max(localRange.max - step, localRange.min, min);
        break;
      case 'Home':
        e.preventDefault();
        newValue = min;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    const newRange = handle === 'min'
      ? { ...localRange, min: newValue }
      : { ...localRange, max: newValue };
    
    setLocalRange(newRange);
    onChange(newRange);
  };

  const handleTrackClick = (e) => {
    if (isDragging) return;
    
    const clickValue = calculateValueFromPosition(e.clientX);
    if (clickValue === null) return;
    
    // Determine which handle is closer
    const distToMin = Math.abs(clickValue - localRange.min);
    const distToMax = Math.abs(clickValue - localRange.max);
    
    if (distToMin < distToMax) {
      const newRange = { ...localRange, min: Math.max(min, Math.min(clickValue, localRange.max)) };
      setLocalRange(newRange);
      onChange(newRange);
    } else {
      const newRange = { ...localRange, max: Math.min(max, Math.max(clickValue, localRange.min)) };
      setLocalRange(newRange);
      onChange(newRange);
    }
  };

  return (
    <div className="w-full p-4">
      {/* Value display */}
      <div className="flex items-center mb-4">
        <h4 className="type-heading-sm text-secondary">{`${label || 'Range'} ${localRange.min} - ${localRange.max}`}</h4>
      </div>

      {/* Visual track and handles */}
      <div 
        ref={trackRef}
        className="relative h-10 md:h-4 mb-4 cursor-pointer"
        onClick={handleTrackClick}
      >
        {/* Background track */}
        <div className="absolute w-full h-full bg-surface-muted rounded-full" />
        
        {/* Active range highlight */}
        <div 
          className="absolute h-full bg-primary"
          style={{
            left: `${minPosition}%`,
            width: `${maxPosition - minPosition}%`
          }}
        />
        
        {/* Min handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:h-6 md:w-6 bg-white rounded-full border-2 border-secondary cursor-grab active:cursor-grabbing select-none touch-none z-10 focus:outline-none focus:ring-2 focus:ring-secondary"
          style={{ left: `${minPosition}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging('min');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsDragging('min');
          }}
          onKeyDown={(e) => handleKeyDown('min', e)}
          role="slider"
          aria-label={label ? `${label} minimum` : 'Minimum value'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localRange.min}
          tabIndex={0}
        />
        
        {/* Max handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 md:h-6 md:w-6 bg-white rounded-full border-2 border-secondary cursor-grab active:cursor-grabbing select-none touch-none z-10 focus:outline-none focus:ring-2 focus:ring-secondary"
          style={{ left: `${ maxPosition}%` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging('max');
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsDragging('max');
          }}
          onKeyDown={(e) => handleKeyDown('max', e)}
          role="slider"
          aria-label={label ? `${label} maximum` : 'Maximum value'}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localRange.max}
          tabIndex={0}
        />
      </div>
    </div>
  );
};

export default RangeSlider;