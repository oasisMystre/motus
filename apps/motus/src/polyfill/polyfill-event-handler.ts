/**
 * Written by <oasisMystre:payouk.mystre@gmail.com>
 * dangerous don't use across multiple projects
 * temporary fix
 */

class CustomEvent<T = any> {
  readonly detail: T;

  constructor(type: string, eventInitDict?: CustomEventInit<T>) {
    // @ts-expect-error we're mutating readonly props for legacy behavior
    this.detail = eventInitDict?.detail;
  }

  /// @deprecated initializer (you usually don't need this, but it's here for compatibility)
  initCustomEvent(
    type: string,
    bubbles?: boolean,
    cancelable?: boolean,
    detail?: T,
  ): void {
    // @ts-expect-error: we're mutating readonly props for legacy behavior
    this.type = type;
    // @ts-expect-error we're mutating readonly props for legacy behavior
    this.bubbles = bubbles ?? false;
    // @ts-expect-error we're mutating readonly props for legacy behavior
    this.cancelable = cancelable ?? false;
    // @ts-expect-error we're mutating readonly props for legacy behavior
    this.detail = detail;
  }
}

class EventEmitter {
  private readonly listeners = new Map<
    string,
    {
      listener: EventListenerOrEventListenerObject;
      option: boolean | AddEventListenerOptions | undefined;
    }[]
  >();

  dispatchEvent(...[event]: Parameters<Window["dispatchEvent"]>): boolean {
    const listeners = this.listeners.get(event.type);
    if (!listeners) return true;

    const toRemove: EventListenerOrEventListenerObject[] = [];

    for (const { listener, option } of listeners) {
      try {
        if (typeof listener === "function") listener(event);
        else listener.handleEvent(event);

        if (typeof option === "object" && option.once) toRemove.push(listener);
      } catch (err) {
        console.warn(`Error in listener for event '${event.type}':`, err);
      }
    }

    if (toRemove.length > 0) {
      this.listeners.set(
        event.type,
        listeners.filter(({ listener }) => !toRemove.includes(listener)),
      );
    }

    return true;
  }

  addEventListener(
    ...[type, listener, option]: Parameters<Window["addEventListener"]>
  ) {
    const existing = this.listeners.get(type) ?? [];
    existing.push({ listener, option });
    this.listeners.set(type, existing);
  }

  removeEventListener(
    ...[type, listenerToRemove]: Parameters<Window["removeEventListener"]>
  ) {
    const existing = this.listeners.get(type);
    if (!existing) return;

    const filtered = existing.filter(
      ({ listener }) => listener !== listenerToRemove,
    );
    if (filtered.length > 0) this.listeners.set(type, filtered);
    else this.listeners.delete(type);
  }
}

const eventEmitter = new EventEmitter();

if (!global.window.CustomEvent)
  global.window.CustomEvent =
    CustomEvent as unknown as typeof global.window.CustomEvent;

if (!global.window.dispatchEvent)
  window.dispatchEvent = eventEmitter.dispatchEvent.bind(eventEmitter);

if (!global.window.addEventListener)
  global.window.addEventListener =
    eventEmitter.addEventListener.bind(eventEmitter);

if (!global.window.removeEventListener)
  global.window.removeEventListener =
    eventEmitter.removeEventListener.bind(eventEmitter);
