/**
 * One "ready" signal for the page. The loader (when mounted) flips it when its
 * curtain starts to lift; entrance timelines and the scroll lock wait on it.
 * Pages without a loader resolve immediately.
 */
type Cb = () => void;
const subs = new Set<Cb>();

export const loaderState = {
  /** A loader is on screen (set before any sibling effect runs). */
  active: false,
  done: false,

  finish() {
    if (this.done) return;
    this.done = true;
    subs.forEach((cb) => cb());
    subs.clear();
  },

  onDone(cb: Cb): () => void {
    if (this.done || !this.active) {
      cb();
      return () => {};
    }
    subs.add(cb);
    return () => {
      subs.delete(cb);
    };
  },

  ready(): Promise<void> {
    return new Promise((resolve) => this.onDone(resolve));
  },
};
