import { signal, effect } from '../runtime/signal'

export interface PageConfig {
  title?: string
  data?: Record<string, any>
  render: (data: any) => string
}

export function definePage(config: PageConfig) {
  return config
}

// 前端运行时：自动绑定数据到 DOM
export function mountPage(config: PageConfig, el: HTMLElement) {
  const state: Record<string, any> = {}

  if (config.data) {
    for (const [key, queryDef] of Object.entries(config.data)) {
      state[key] = { loading: true, data: null, error: null }

      const url = queryDef._url
      const refresh = queryDef._refresh

      async function load() {
        state[key] = { loading: true, data: state[key]?.data ?? null, error: null }
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`${res.status}`)
          state[key] = { loading: false, data: await res.json(), error: null }
        } catch (e: any) {
          state[key] = { loading: false, data: null, error: e.message }
        }
        el.innerHTML = config.render(state)
      }

      load()
      if (refresh) setInterval(load, refresh)
    }
  }

  el.innerHTML = config.render(state)
}

// 数据查询描述符
export function pageQuery(model: string, opts?: { where?: any; limit?: number; refresh?: number }) {
  const params = new URLSearchParams()
  if (opts?.where) params.set('where', JSON.stringify(opts.where))
  if (opts?.limit) params.set('limit', String(opts.limit))
  const qs = params.toString()

  return {
    _url: `/api/${model.toLowerCase()}s${qs ? '?' + qs : ''}`,
    _refresh: opts?.refresh,
  }
}
