import { useEffect, useLayoutEffect } from 'react';

/**
 * Cambiar entre useEffect y useLayoutEffect siguiendo el entorno de ejecución,
 * solucionar el problema de useEffect que no se ejecuta correctamente en el lado del servidor.
 * @returns {(effect: React.EffectCallback, deps?: React.DependencyList | undefined) => void}
 */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
