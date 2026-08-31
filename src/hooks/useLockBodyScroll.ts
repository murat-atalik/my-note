import { useEffect } from 'react';

let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';
let originalDocOverflow = '';

export function useLockBodyScroll(lock: boolean = true) {
  useEffect(() => {
    if (!lock || typeof document === 'undefined') return;

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;
      originalDocOverflow = document.documentElement.style.overflow;

      // Check if there is a scrollbar to avoid layout jump
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = originalOverflow || '';
        document.body.style.paddingRight = originalPaddingRight || '';
        document.documentElement.style.overflow = originalDocOverflow || '';
      }
    };
  }, [lock]);
}

