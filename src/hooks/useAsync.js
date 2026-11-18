import { useEffect, useState, useCallback } from 'react';


export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelado = false;
    setState({ status: 'loading', data: null, error: null });
    fn()
      .then((data) => !cancelado && setState({ status: 'ok', data, error: null }))
      .catch((error) => !cancelado && setState({ status: 'error', data: null, error }));
    return () => { cancelado = true; };

  }, [...deps, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}

export function usePageTitle(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Guia do Brasil` : 'Guia do Brasil';
  }, [titulo]);
}
