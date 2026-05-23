import { useState, useEffect, useRef } from 'react';

export function useAutoSave(deps: unknown[]) {
  const [saveState, setSaveState] = useState<'idle' | 'dirty' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip first render
    const hasContent = deps.some(d => d && (typeof d !== 'string' || d.length > 0));
    if (!hasContent) return;

    setSaveState('dirty');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState('saved'), 2000);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => setSaveState('idle');

  return { saveState, reset };
}
