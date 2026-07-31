import * as React from "react";

/** Retorna `value` com atraso — usado para não disparar busca a cada tecla digitada. */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
