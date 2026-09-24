// Collapse realtime bursts and allow at most one request at a time.
export function coalescedRefresh(refresh, delay = 150) {
  let timer;
  let running = false;
  let pending = false;
  let disposed = false;
  const run = async () => {
    timer = undefined;
    if (disposed || running) return;
    pending = false;
    running = true;
    try { await refresh(); } catch { /* Keep the current data; manual refresh exposes errors. */ }
    finally {
      running = false;
      if (pending && !disposed) timer = setTimeout(run, delay);
    }
  };
  const request = () => {
    if (disposed) return;
    pending = true;
    if (!running && timer === undefined) timer = setTimeout(run, delay);
  };
  request.dispose = () => { disposed = true; clearTimeout(timer); };
  return request;
}
