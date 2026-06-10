import { signal, type Signal } from './signal'

export interface QueryResult<T> {
  data: Signal<T | null>
  loading: Signal<boolean>
  error: Signal<Error | null>
  refetch: () => Promise<void>
}

const cache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 30_000

interface QueryOptions {
  where?: Record<string, any>
  include?: Record<string, boolean>
  orderBy?: Record<string, 'asc' | 'desc'>
  limit?: number
  offset?: number
}

function buildURL(model: string, opts?: QueryOptions): string {
  const base = `/api/${model.toLowerCase()}s`
  if (!opts) return base
  const params = new URLSearchParams()
  if (opts.where)    params.set('where', JSON.stringify(opts.where))
  if (opts.include)  params.set('include', JSON.stringify(opts.include))
  if (opts.orderBy)  params.set('orderBy', JSON.stringify(opts.orderBy))
  if (opts.limit)    params.set('limit', String(opts.limit))
  if (opts.offset)   params.set('offset', String(opts.offset))
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function query<T = any>(model: string, opts?: QueryOptions): QueryResult<T[]> {
  const data    = signal<T[] | null>(null)
  const loading = signal(true)
  const error   = signal<Error | null>(null)
  const key = `${model}:${JSON.stringify(opts ?? {})}`

  async function fetch_() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(buildURL(model, opts))
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      data.value = json
      cache.set(key, { data: json, time: Date.now() })
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const cached = cache.get(key)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    data.value = cached.data
    loading.value = false
    fetch_()
  } else {
    fetch_()
  }

  return { data, loading, error, refetch: fetch_ }
}

export async function mutate<T = any>(
  action: `${string}.${'create' | 'update' | 'delete'}`,
  input: Record<string, any>
): Promise<T> {
  const [model, method] = action.split('.')
  const url = `/api/${model.toLowerCase()}s`
  const init: RequestInit = { headers: { 'Content-Type': 'application/json' } }

  if (method === 'create') {
    init.method = 'POST'
    init.body = JSON.stringify(input)
  } else if (method === 'update') {
    init.method = 'PATCH'
    init.body = JSON.stringify(input)
  } else if (method === 'delete') {
    init.method = 'DELETE'
    init.body = JSON.stringify({ id: input.id })
  }

  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
