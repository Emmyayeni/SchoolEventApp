import { useCallback, useEffect, useState } from "react";

export function useDatabaseOptions(loader) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision(value => value + 1), []);

  useEffect(() => {
    let active = true;
    setOptions([]);
    setLoading(true);
    setError(null);
    Promise.resolve().then(loader).then(rows => {
      if (active) setOptions(rows);
    }).catch(() => {
      if (active) setError("Could not load choices. Check your connection and try again.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loader, revision]);

  return { options, loading, error, onRetry: retry };
}
