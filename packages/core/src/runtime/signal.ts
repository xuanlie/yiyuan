type Subscriber = () => void
let activeEffect: Subscriber | null = null

export class Signal<T> {
  private _value: T
  private subs = new Set<Subscriber>()

  constructor(value: T) {
    this._value = value
  }

  get value(): T {
    if (activeEffect) this.subs.add(activeEffect)
    return this._value
  }

  set value(next: T) {
    if (Object.is(this._value, next)) return
    this._value = next
    queueMicrotask(() => this.subs.forEach(fn => fn()))
  }

  peek(): T {
    return this._value
  }
}

export function signal<T>(value: T): Signal<T> {
  return new Signal(value)
}

export function effect(fn: () => void): () => void {
  activeEffect = fn
  fn()
  activeEffect = null
  return () => {}
}

export function computed<T>(fn: () => T): Signal<T> {
  const s = new Signal(fn())
  activeEffect = () => { s.value = fn() }
  fn()
  activeEffect = null
  return s
}
