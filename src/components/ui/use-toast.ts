"use client";

// Lightweight toast store (adapted from the shadcn/ui reducer pattern).
import * as React from "react";
import type { ToastProps } from "./toast";

const TOAST_LIMIT = 4;
const TOAST_REMOVE_DELAY = 6000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

type State = { toasts: ToasterToast[] };

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function dispatch(next: State) {
  memoryState = next;
  listeners.forEach((l) => l(memoryState));
}

function scheduleRemoval(id: string) {
  if (timeouts.has(id)) return;
  const t = setTimeout(() => {
    timeouts.delete(id);
    dispatch({ toasts: memoryState.toasts.filter((x) => x.id !== id) });
  }, TOAST_REMOVE_DELAY);
  timeouts.set(id, t);
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  const dismiss = () =>
    dispatch({
      toasts: memoryState.toasts.map((t) =>
        t.id === id ? { ...t, open: false } : t,
      ),
    });

  dispatch({
    toasts: [
      {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) {
            dismiss();
            scheduleRemoval(id);
          }
        },
      },
      ...memoryState.toasts,
    ].slice(0, TOAST_LIMIT),
  });

  return { id, dismiss };
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const i = listeners.indexOf(setState);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);
  return { ...state, toast };
}
