import { setWsConnected, setLiveKpi } from "@/store/slices/networkUiSlice";
import type { AppDispatch } from "@/store/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { VITE_WS_ENDPOINT_URL } from "@/lib/variables";

/** Subscribes to backend /ws/telemetry and streams KPI updates into Redux. */
export function useTelemetryWs(url = `${VITE_WS_ENDPOINT_URL}/ws/telemetry`) {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (typeof window === "undefined") return;
    let ws: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(url);
      } catch {
        return;
      }
      ws.onopen = () => dispatch(setWsConnected(true));
      ws.onclose = () => {
        dispatch(setWsConnected(false));
        if (!closed) retry = setTimeout(connect, 3000);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data) as {
            event: string;
            data: Record<string, number>;
          };
          if (msg.event === "kpi") dispatch(setLiveKpi(msg.data));
        } catch {
          /* ignore */
        }
      };
    };
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, [url, dispatch]);
}
