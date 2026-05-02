import { useState, useRef, useCallback, useEffect } from "react";

const Slider = ({ sliderMin = 1, sliderMax = 10, step = 1, updateFilter }) => {
  const [range, setRange] = useState({min: sliderMin, max: sliderMax});
  const [dragState, setDragState] = useState({ isDragging: false, dragType: null})
  const sliderRef = useRef(null);

  const sliderValues = { min: sliderMin, max: sliderMax };

  // convert position to value
  const positionToValue = useCallback((position, trackWidth) => {
    const percentage = Math.max(0, Math.min(1, position / trackWidth));
    const rawValue = sliderValues.min + (percentage * (sliderValues.max - sliderValues.min));
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.min(sliderValues.max, Math.max(sliderValues.min, steppedValue));
  }, [sliderValues.min, sliderValues.max, step]);

  // convert value to position percentage
  const valueToPosition = useCallback((value) => {
    return ((value - sliderValues.min) / (sliderValues.max - sliderValues.min)) * 100;
  }, [sliderValues.min, sliderValues.max]);

  // handle mouse/touch start
  const handleDragStart = useCallback((e, type) => {
    e.preventDefault();
    setDragState({ isDragging: true, dragType: type });
  }, []);

  // handle mouse/touch move
  const handleDragMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const trackRect = sliderRef.current.getBoundingClientRect();
    const position = clientX - trackRect.left;
    const newValue = positionToValue(position, trackRect.width);

    setRange(prev => {
      let newRange = { ...prev };
      if (dragState.dragType === 'min') {
        newRange.min = Math.min(newValue, prev.max - step);
      } else if (dragState.dragType === 'max') {
        newRange.max = Math.max(newValue, prev.min + step);
      }
      return newRange;
    });
  }, [dragState, positionToValue, step]);

// handle mouse/touch end
const handleDragEnd = useCallback(() => {
  setDragState({ isDragging: false, dragType: null });
  updateFilter('Rating', range , 'range', 'rating');
}, [range, updateFilter]);

// Add global event listeners dragging
useEffect(() => {
  if (dragState.isDragging) {
    const handleMouseMove = (e) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    const controller = new AbortController();

    window.addEventListener('mousemove', handleMouseMove, { signal: controller.signal });
    window.addEventListener('mouseup', handleMouseUp, { signal: controller.signal });
    window.addEventListener('touchmove', handleTouchMove, { signal: controller.signal });
    window.addEventListener('touchend', handleTouchEnd, { signal: controller.signal });

    return () => {
      controller.abort();
    };
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dragState.isDragging]);

const minPosition = valueToPosition(range.min);
const maxPosition = valueToPosition(range.max);

  return (
    <div className="slider-container w-full py-4 mx-2">
      <div className="slider-label">
        <h4>Showing Ratings {range.min} - {range.max}</h4>
      </div>
      <div className="slider-track-container mt-4">
        <div 
          ref={sliderRef}
          className="slider-track relative h-8 bg-surface-muted rounded-full cursor-pointer"
          onClick={(e) => {
            if (dragState.isDragging) return;

            const rect = sliderRef.current.getBoundingClientRect();
            const position = e.clientX - rect.left;
            const clickValue = positionToValue(position, rect.width);

            // Determine whether to move min or max based on proximity
            const distanceToMin = Math.abs(clickValue - range.min);
            const distanceToMax = Math.abs(clickValue - range.max);

            let newRange;
            if (distanceToMin < distanceToMax) {
              newRange = {...range, min: Math.min(clickValue, range.max)};
            } else {
              newRange = {...range, max: Math.max(clickValue, range.min)};
            }

            setRange(newRange);
            updateFilter('Rating', newRange , 'range', 'rating');
          }} 
        >
          <div 
            className="slider-active-range absolute h-full bg-primary rounded-full"
            style={{ 
              left: `${minPosition}%`, 
              right: `${100 - maxPosition}%` 
            }} 
          />
          <div 
            className={`slider-handle-min touch-none absolute top-1/2 transform -translate-y-1/2 -translate-x-2.5 w-8 h-8 bg-white border-2 border-secondary rounded-full cursor-grab
               shadow-md transition-transform
              ${dragState.isDragging && dragState.dragType === 'min' ? 'cursor-grabbing' : ''}`}
            style={{ left: `${minPosition}%` }}
            onMouseDown={(e) => handleDragStart(e, 'min')}
            onTouchStart={(e) => handleDragStart(e, 'min')}
          />
          <div 
            className={`slider-handle-max touch-none absolute w-8 h-8 bg-white border-2 border-secondary rounded-full cursor-grab
              top-1/2 transform -translate-y-1/2 translate-x-2.5 shadow-md transition-transform
              ${dragState.isDragging && dragState.dragType === 'max' ? 'cursor-grabbing' : ''}`}
            style={{ right: `${100 - maxPosition}%` }}
            onMouseDown={(e) => handleDragStart(e, 'max')}
            onTouchStart={(e) => handleDragStart(e, 'max')}
          />
          </div>
        </div>
      </div>
  )
}

export default Slider;