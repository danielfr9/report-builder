// Source: https://github.com/mantinedev/mantine/blob/master/packages/@mantine/hooks/src/use-debounced-callback/use-debounced-callback.ts
import { useEffect, useMemo, useRef } from "react";

export function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useMemo(() => ((...args) => callbackRef.current?.(...args)) as T, []);
}
