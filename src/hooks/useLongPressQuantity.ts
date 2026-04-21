'use client';
import { useCallback, useRef } from 'react';

/**
 * Hook para manejar el incremento/decremento rápido al mantener presionado un botón.
 * @param onStep Función que realiza el incremento o decremento.
 * @param delay Tiempo de espera inicial antes de empezar el auto-repeat (ms).
 * @param interval Tiempo entre repeticiones (ms).
 */
export function useLongPressQuantity(onStep: () => void, delay = 5000, interval = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPressed = useRef(false);
  const lastInteractionTime = useRef(0);

  const stop = useCallback(() => {
    isPressed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    // Evitar disparos dobles por eventos emulados (touch + mouse)
    const now = Date.now();
    if (now - lastInteractionTime.current < 100) return;
    lastInteractionTime.current = now;

    // Solo clic izquierdo
    if ('button' in e && e.button !== 0) return;

    if (isPressed.current) return;
    isPressed.current = true;

    // Primer paso inmediato
    onStep();

    // Iniciar el temporizador para el repetición automática
    timeoutRef.current = setTimeout(() => {
      if (!isPressed.current) return;
      intervalRef.current = setInterval(() => {
        onStep();
      }, interval);
    }, delay);
  }, [onStep, delay, interval]);

  return {
    // Usamos Pointer Events que es el estándar moderno para Mouse, Touch y Stylus
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // Prevenir el menú contextual para evitar interrupciones
    onContextMenu: (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
    },
    // Evitar scroll accidental en botones durante el toque
    style: { touchAction: 'none' } as React.CSSProperties,
  };
}
