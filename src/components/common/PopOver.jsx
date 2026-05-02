import { useState, useEffect } from 'react';
import { DownArrowIcon } from '@icons';

/**
 * A modular PopOver component that displays a toggleable dropdown menu.
 * Manages its own open/close state and handles click-outside and escape key events.
 * 
 * param {string} label - The label text displayed next to the toggle button
 * param {string} className - Additional CSS classes for the container
 * param {string} popoverClassName - Additional CSS classes for the popover content
 * param {string} buttonClassName - Additional CSS classes for the toggle button
 * param {string} id - Unique identifier for the popover (used for ARIA attributes)
 */

const PopOver = ({
  label,
  children,
  className = '',
  popoverClassName = '',
  buttonClassName = '',
  id
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverId = id || `popover-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const labelId = `${popoverId}-label`;

  const togglePopover = () => {
    setIsOpen(prev => {
      const newState = !prev;
      return newState;
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e) => {
      if (e.target.closest('.popover') || e.target.closest('.popover-button')) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`popover flex flex-col justify-center relative ${className}`}>
      <div className="flex flex-row justify-between items-center">
        <h4 className="m-0" id={labelId}>
          {label}
        </h4>
        <button
          className={`popover-button bg-transparent border-2 border-white rounded-full p-2 w-8 h-8 ${buttonClassName}`}
          onClick={togglePopover}
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={popoverId}
          aria-label={`Show options for ${label}`}
        >
          <DownArrowIcon className="w-4 h-4" />
        </button>
      </div>
      {isOpen && (
        <div
          id={popoverId}
          className={`w-full flex flex-row flex-wrap absolute top-full bg-surface border-2 rounded-2xl p-4 my-2 gap-2 overflow-y-auto z-10 ${popoverClassName}`}
          role="dialog"
          aria-labelledby={labelId}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default PopOver;
