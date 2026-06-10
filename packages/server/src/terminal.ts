const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  cyan:    '\x1b[36m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  bgCyan:  '\x1b[46m\x1b[30m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgYellow:'\x1b[43m\x1b[30m',
  bgRed:   '\x1b[41m\x1b[30m',
  bgBlue:  '\x1b[44m\x1b[37m',
}

const W = (s: string) => process.stdout.write(s)

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function box(lines: string[], borderColor: string = C.cyan) {
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length))
  const pad = (s: string) => s + ' '.repeat(maxLen - stripAnsi(s).length)
  const top = borderColor + '┌' + '─'.repeat(maxLen + 2) + '┐' + C.reset
  const bot = borderColor + '└' + '─'.repeat(maxLen + 2) + '┘' + C.reset
  const mid = borderColor + '│' + C.reset
  W('\n')
  W('  ' + top + '\n')
  for (const line of lines) {
    W('  ' + mid + ' ' + pad(line) + ' ' + mid + '\n')
  }
  W('  ' + bot + '\n')
}

function timestamp(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function tag(label: string, bg: string): string {
  return `${bg} ${label} ${C.reset}`
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 3) + '...'
}

export function printBanner(port: number) {
  const lines = [
    `${C.cyan}${C.bold}一元${C.reset}${C.dim} Yiyuan${C.reset}  ${C.dim}v0.0.1${C.reset}`,
    '',
    `${C.white}一个 Schema，驱动全栈${C.reset}`,
    '',
    `${C.green}▶${C.reset}  ${C.bold}http://localhost:${port}${C.reset}  ${C.green}▶${C.reset}`,
  ]
  box(lines, C.cyan)
  W('\n')
}

export function printCompileStep(file: string) {
  W(`  ${C.dim}${timestamp()}${C.reset}  ${C.bgCyan} GEN ${C.reset}  ${C.white}${file}${C.reset}\n`)
}

export function printCompileDone(modelCount: number) {
  W(`\n  ${C.green}${C.bold}✓${C.reset}  ${modelCount} models compiled\n\n`)
}

export function printRequest(method: string, path: string, status: number, ms: number) {
  const methodColors: Record<string, string> = {
    GET: C.blue, POST: C.green, PATCH: C.yellow, DELETE: C.red,
  }
  const color = methodColors[method] ?? C.white
  const statusColor = status >= 400 ? C.red : C.green
  W(`  ${C.dim}${timestamp()}${C.reset}  ${color}${C.bold}${method.padEnd(6)}${C.reset} ${C.white}${path}${C.reset}  ${statusColor}${status}${C.reset}  ${C.dim}${ms}ms${C.reset}\n`)
}

export function printDBCreate(model: string, record: Record<string, any>) {
  W('\n')
  W(`  ${C.dim}${timestamp()}${C.reset}  ${tag('CREATE', C.bgGreen)}  ${C.bold}${model}${C.reset}\n`)
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}┌─────────────────────────────┐${C.reset}\n`)
  for (const [key, val] of Object.entries(record)) {
    const displayVal = typeof val === 'string' ? truncate(val, 30) : JSON.stringify(val)
    const keyStr = C.cyan + key.padEnd(12) + C.reset
    const valStr = C.white + displayVal + C.reset
    W(`  ${C.dim}                   ${C.reset}  ${C.dim}│${C.reset} ${keyStr} ${valStr}\n`)
  }
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}└─────────────────────────────┘${C.reset}\n\n`)
}

export function printDBRead(model: string, count: number, data: Record<string, any>[]) {
  W('\n')
  W(`  ${C.dim}${timestamp()}${C.reset}  ${tag('QUERY', C.bgBlue)}  ${C.bold}${model}${C.reset}  ${C.dim}→ ${count} records${C.reset}\n`)
  if (count === 0) {
    W(`  ${C.dim}                   ${C.reset}  ${C.dim}(empty)${C.reset}\n\n`)
    return
  }
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}┌────────────────────────────────────────────┐${C.reset}\n`)
  for (const record of data) {
    const id = C.dim + truncate(record.id ?? '?', 8) + C.reset
    const title = C.white + truncate(record.title ?? record.name ?? '—', 28) + C.reset
    const status = record.status ? statusBadge(record.status) : ''
    W(`  ${C.dim}                   ${C.reset}  ${C.dim}│${C.reset}  ${id}   ${title}  ${status} ${C.dim}│${C.reset}\n`)
  }
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}└────────────────────────────────────────────┘${C.reset}\n\n`)
}

export function printDBUpdate(model: string, id: string, changes: Record<string, any>) {
  W('\n')
  W(`  ${C.dim}${timestamp()}${C.reset}  ${tag('UPDATE', C.bgYellow)}  ${C.bold}${model}${C.reset}  ${C.dim}#${truncate(id, 8)}${C.reset}\n`)
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}┌─────────────────────────────┐${C.reset}\n`)
  for (const [key, val] of Object.entries(changes)) {
    if (key === 'id') continue
    const arrow = `${C.yellow}→${C.reset}`
    W(`  ${C.dim}                   ${C.reset}  ${C.dim}│${C.reset} ${C.cyan}${key.padEnd(12)}${C.reset} ${arrow} ${C.white}${val}${C.reset}\n`)
  }
  W(`  ${C.dim}                   ${C.reset}  ${C.dim}└─────────────────────────────┘${C.reset}\n\n`)
}

export function printDBDelete(model: string, id: string) {
  W('\n')
  W(`  ${C.dim}${timestamp()}${C.reset}  ${tag('DELETE', C.bgRed)}  ${C.bold}${model}${C.reset}  ${C.dim}#${truncate(id, 8)}${C.reset}\n\n`)
}

export function printSeparator() {
  W(`  ${C.dim}${'─'.repeat(50)}${C.reset}\n`)
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    todo:   `${C.gray}[ todo ]${C.reset}`,
    doing:  `${C.yellow}[ doing ]${C.reset}`,
    done:   `${C.green}[ done  ]${C.reset}`,
  }
  return map[status] ?? `${C.dim}[${status}]${C.reset}`
}
