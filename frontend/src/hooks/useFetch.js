import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/getErrorMessage';

// fetcher doit être stable (fonction importée ou useCallback)
export function useFetch(fetcher) {
  const [state, setState] = useState({ fetcher: null, reloadKey: 0, data: null, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => { if (!cancelled) setState({ fetcher, reloadKey, data, error: '' }); })
      .catch((err) => {
        if (!cancelled) setState({ fetcher, reloadKey, data: null, error: getErrorMessage(err) });
      });
    return () => { cancelled = true; };
  }, [fetcher, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  // "loading" seulement au premier chargement ou quand la requête change (pas au rechargement)
  const loading = state.fetcher !== fetcher;
  return { data: state.data, error: state.error, loading, reload };
}
