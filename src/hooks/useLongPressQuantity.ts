'use client';
import { useCallback, useRef } from 'react';

/**
 * Hook para manejar el incremento/decremento rápido al mantener presionado un botón.
 * @param onStep Función que realiza el incremento o decremento.
 * @param delay Tiempo de espera inicial antes de empezar el auto-repeat (ms).
 * @param interval Tiempo entre repeticiones (ms).
 */
export function useLongPressQuantity(onStep: () => void, delay = 1400, interval = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    if (timeoutRef.current || intervalRef.current) return;

    onStep();

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onStep();
      }, interval);
    }, delay);
  }, [onStep, delay, interval]);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return {
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      start();
    },
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e: React.TouchEvent) => {
      // Iniciar el long press en táctil
      start();
    },
    onTouchEnd: stop,
    onTouchCancel: stop,
    // Prevenir el menú contextual (clic derecho / mantener presionado) 
    // mientras se ajusta la cantidad
    onContextMenu: (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
    },
  };
}
