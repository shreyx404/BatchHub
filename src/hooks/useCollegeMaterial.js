import { useState, useEffect, useCallback } from 'react';
import { fetchCollegeMaterialUrl, updateCollegeMaterialUrl } from '../lib/api';
import { DEFAULT_COLLEGE_MATERIAL_URL } from '../lib/constants';

let cachedMaterialUrl = null;
const SYNC_EVENT = 'batchhub_material_url_changed';

export function useCollegeMaterial() {
  const [materialUrl, setMaterialUrl] = useState(cachedMaterialUrl || DEFAULT_COLLEGE_MATERIAL_URL);
  const [loading, setLoading] = useState(!cachedMaterialUrl);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = await fetchCollegeMaterialUrl();
      if (url) {
        cachedMaterialUrl = url;
        setMaterialUrl(url);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch college material URL');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if not already cached
    if (!cachedMaterialUrl) {
      load();
    }

    const handleSync = (e) => {
      if (e.detail?.url) {
        cachedMaterialUrl = e.detail.url;
        setMaterialUrl(e.detail.url);
      }
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, [load]);

  const updateUrl = useCallback(async (newUrl) => {
    const result = await updateCollegeMaterialUrl(newUrl);
    const updated = result?.value || newUrl;
    cachedMaterialUrl = updated;
    setMaterialUrl(updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { url: updated } }));
    }
    return result;
  }, []);

  return {
    materialUrl,
    loading,
    error,
    updateUrl,
    refetch: load,
  };
}
