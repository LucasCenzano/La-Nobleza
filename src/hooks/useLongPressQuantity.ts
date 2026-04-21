import { useCallback, useRef } from 'react';

/**
 * Hook para manejar el incremento/decremento rápido al mantener presionado un botón.
 * @param onStep Función que realiza el incremento o decremento.
 * @param delay Tiempo de espera inicial antes de empezar el auto-repeat (ms).
 * @param interval Tiempo entre repeticiones (ms).
 */
export function useLongPressQuantity(onStep: () => void, delay = 400, interval = 80) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    // Si ya está funcionando, no hacer nada
    if (timeoutRef.current || intervalRef.current) return;

    // Ejecutar el primer paso inmediatamente
    onStep();

    // Esperar el delay inicial
    timeoutRef.current = setTimeout(() => {
      // Iniciar el intervalo de repetición
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
      if (e.button !== 0) return; // Solo clic izquierdo
      start();
    },
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e: React.TouchEvent) => {
      // Prevenir el menú contextual en móviles si es necesario, 
      // pero aquí solo queremos detectar el inicio.
      start();
    },
    onTouchEnd: stop,
    // Prevenir scroll accidental o comportamientos extraños en móviles
    onTouchCancel: stop,
  };
}
