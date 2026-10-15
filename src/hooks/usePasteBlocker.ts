import { useEffect, useRef } from 'react';

/**
 * Blocks pasting into the editor while the contest's copy-paste blocker is on.
 *
 * It must never open a browser dialog: alert()/confirm() take focus from the
 * page, which fires a window blur. The strict-mode screen protection and the
 * integrity monitor both treat a blur as "left the window", so a single blocked
 * paste used to black out the screen and count as a tab switch.
 */
export function usePasteBlocker(
  getEditorNode: () => HTMLElement | null | undefined,
  enabled: boolean,
  onBlocked: () => void,
) {
  const getNodeRef = useRef(getEditorNode);
  const onBlockedRef = useRef(onBlocked);

  // Keep the latest callbacks without re-subscribing the listener every render.
  useEffect(() => {
    getNodeRef.current = getEditorNode;
    onBlockedRef.current = onBlocked;
  });

  useEffect(() => {
    if (!enabled) return;

    const handlePaste = (e: ClipboardEvent) => {
      const node = getNodeRef.current();
      // Only intercept pastes that land inside the editor
      if (node && node.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        onBlockedRef.current();
      }
    };

    // Capture phase so it runs BEFORE Monaco handles the event
    window.addEventListener('paste', handlePaste, true);
    return () => window.removeEventListener('paste', handlePaste, true);
  }, [enabled]);
}
