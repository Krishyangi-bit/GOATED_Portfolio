/**
 * Tiny event bus so distant parts of the comic (secret code, sound, sections)
 * can nudge the character without prop-drilling.
 */
type Events = {
  secret: void;
  bam: void;
};
type Handler<T> = (payload: T) => void;

const handlers: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {};

export function on<K extends keyof Events>(name: K, fn: Handler<Events[K]>) {
  const set = (handlers[name] ??= new Set()) as Set<Handler<Events[K]>>;
  set.add(fn);
  return () => {
    set.delete(fn);
  };
}

export function emit<K extends keyof Events>(name: K, payload?: Events[K]) {
  handlers[name]?.forEach((fn) => (fn as Handler<Events[K] | undefined>)(payload));
}
