import { useState, useEffect } from "react";

/**
 * A custom hook that delays updating a value until a specified time has passed
 * after the last change. Useful for debouncing search inputs.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (defaults to 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}