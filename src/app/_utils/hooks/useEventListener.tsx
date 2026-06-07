/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
import { ReactElement, RefObject, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

// See: https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect

function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
): void;
function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement,
>(eventName: K, handler: (event: HTMLElementEventMap[K]) => void, element: RefObject<T>): void;

/**
 *
 * @param eventName Use EventListener with simplicity by React Hook. It takes as parameters a eventName, a call-back functions (handler) and optionally a reference element. You can see above two examples using useRef and window based event importing the "Example" component.
 * @param handler
 * @param element
 */
function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  T extends HTMLElement | void = void,
>(
  eventName: KW | KH,
  handler: (event: WindowEventMap[KW] | HTMLElementEventMap[KH] | Event) => void,
  element?: RefObject<T>,
) {
  // Crear una referencia que almacene el controlador
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Definir el objetivo de escucha
    const targetElement: T | Window = element?.current || window;
    if (!(targetElement && targetElement.addEventListener)) {
      return;
    }

    // Cree un detector de eventos que llame a la función del controlador almacenada en ref
    const eventListener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, eventListener);

    // Eliminar el event listener en la limpieza
    return () => {
      targetElement.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

export default useEventListener;

/**
 * Ejemplo de componente React del uso de useEventListener.
 * @returns {ReactElement}
 */
export function Example(): ReactElement {
  //  Definir referencia de botón

  const buttonRef = useRef<HTMLButtonElement>(null);

  const onScroll = (event: Event) => {
    console.log('window scrolled!', event);
  };

  const onClick = (event: Event) => {
    console.log('button clicked!', event);
  };

  // ejemplo con evento basado en ventana

  useEventListener('scroll', onScroll);

  // ejemplo con evento basado en elementos

  useEventListener('click', onClick, buttonRef);

  return (
    <div style={{ minHeight: '200vh' }}>
      <button type="button" ref={buttonRef}>
        Click me
      </button>
    </div>
  );
}
