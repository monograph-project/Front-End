import { useMemo, useState } from 'react'

const WEEKS = 53
const DAYS_PER_WEEK = 7
const ACTIVE_YEAR = 2026
const CELL_GAP = 2
const LABEL_GUTTER = 28

const HEAT_COLORS = [
  'bg-[#ebedf0]',
  'bg-[#9be9a8]',
  'bg-[#40c463]',
  'bg-[#30a14e]',
  'bg-[#216e39]',
]
const GHOST_COLORS = [
  "bg-[#ebedf0]/20",
  "bg-[#ebedf0]/30",
  "bg-[#ebedf0]/40",
  "bg-[#ebedf0]/50",
  "bg-[#ebedf0]/60",
];




const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getPastNDates(n) {
  const days = []
  const today = new Date()

  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push(date)
  }

  return days
}

function toDateKey(date) {
  return date.toISOString().split('T')[0]
}

function getMonthTicks(columns) {
  let lastMonth = ''
  const ticks = []

  columns.forEach((column, index) => {
    const first = column.find(Boolean)
    if (!first) return

    const month = first.date.toLocaleString('en-US', { month: 'short' })
    if (month !== lastMonth) {
      lastMonth = month
      ticks.push({ month, index })
    }
  })

  return ticks
}

function getHeatClass(count) {
  if (count <= 0) return HEAT_COLORS[0]
  if (count === 1) return HEAT_COLORS[1]
  if (count === 2) return HEAT_COLORS[2]
  if (count <= 4) return HEAT_COLORS[3]
  return HEAT_COLORS[4]
}

function buildContributionMap(dates) {
  const map = {}

  dates.forEach((date) => {
    map[toDateKey(date)] = 0
  })

  const total = dates.length
  const marks = [total - 190, total - 12, total - 10]

  marks.forEach((index) => {
    if (index >= 0 && index < total) {
      map[toDateKey(dates[index])] = 1
    }
  })

  return map
}

function Tooltip({ state }) {
  if (!state.show) return null

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-[#24292f] px-2 py-1.5 text-xs text-white shadow-lg"
      style={{ left: state.x + 12, top: state.y + 12 }}
    >
      {state.text}
    </div>
  )
}

export default function ProjectSchedule() {
  const [tooltip, setTooltip] = useState({
    show: false,
    text: '',
    x: 0,
    y: 0,
  })

  const dates = useMemo(() => getPastNDates(WEEKS * DAYS_PER_WEEK), [])
  const contributionMap = useMemo(() => buildContributionMap(dates), [dates])

  const columns = useMemo(() => {
    const output = []

    for (let w = 0; w < WEEKS; w += 1) {
      const week = []

      for (let d = 0; d < DAYS_PER_WEEK; d += 1) {
        const idx = (w * DAYS_PER_WEEK) + d
        const date = dates[idx]

        if (!date) {
          week.push(null)
          continue
        }

        const key = toDateKey(date)
        week.push({
          date,
          count: contributionMap[key] ?? 0,
        })
      }

      output.push(week)
    }

    return output
  }, [dates, contributionMap])

  const totalContributions = useMemo(
    () => Object.values(contributionMap).reduce((sum, count) => sum + count, 0),
    [contributionMap],
  )

  const monthTicks = useMemo(() => getMonthTicks(columns), [columns])

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#24292f]">
      <main className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <section>
          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Popular repositories
            </h2>
            <button type="button" className="text-sm text-[#0969da] hover:underline">
              Customize your pins
            </button>
          </div>

          <article className="w-full max-w-2xl rounded-md border border-[#d0d7de] bg-white px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <a href="#" className="text-xl font-semibold text-[#0969da] hover:underline">
                test-repo
              </a>
              <span className="rounded-full border border-[#d0d7de] px-2.5 py-0.5 text-sm font-medium text-[#57606a]">
                Public
              </span>
            </div>
          </article>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px]">
          <div className="order-2 lg:order-1">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-2xl font-normal sm:text-3xl">
                {totalContributions} contributions in the last year
              </h3>
              <button
                type="button"
                className="hidden items-center gap-1 text-sm text-[#57606a] lg:inline-flex"
              >
                Contribution settings
                <span className="text-xs">▼</span>
              </button>
            </div>

            <div className="rounded-md border border-[#d0d7de] bg-white p-4 sm:p-5">
              <div className="overflow-hidden">
                <div>
                  <div className="mb-1.5" style={{ paddingLeft: `${LABEL_GUTTER}px` }}>
                    <div className="relative h-4">
                      {monthTicks.map((tick) => (
                        <span
                          key={`${tick.month}-${tick.index}`}
                          className="absolute text-[10px] text-[#57606a]"
                          style={{ left: `${(tick.index / WEEKS) * 100}%` }}
                        >
                          {tick.month}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div
                      className="grid text-[10px] leading-none text-[#57606a]"
                      style={{
                        width: `${LABEL_GUTTER - 8}px`,
                        gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))`,
                        rowGap: `${CELL_GAP}px`,
                      }}
                    >
                      {WEEKDAY_LABELS.map((dayLabel, index) => (
                        <span key={index} className="flex items-center">
                          {dayLabel}
                        </span>
                      ))}
                    </div>

                    <div
                      className="grid flex-1"
                      style={{
                        gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
                        columnGap: `${CELL_GAP}px`,
                      }}
                    >
                      {columns.map((week, ci) => (
                        <div
                          key={ci}
                          className="grid"
                          style={{
                            gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))`,
                            rowGap: `${CELL_GAP}px`,
                          }}
                        >
                          {week.map((cell, ri) => {
                           if (!cell) {
                                    return (
                                        <span
                                        key={ri}
                                        className="aspect-square w-full rounded-[2px] bg-[#ebedf0]/50 dark:bg-[#2d333b]/40"
                                        />
                                    )
                                    }

                            const text = `${cell.count} ${
                              cell.count === 1 ? 'contribution' : 'contributions'
                            } on ${cell.date.toLocaleDateString()}`

                            return (
                              <button
                                key={ri}
                                type="button"
                                className={`aspect-square w-full rounded-[2px] border border-black/5 transition hover:ring-1 hover:ring-[#0969da]/40 ${getHeatClass(cell.count)}`}
                                onMouseEnter={(event) =>
                                  setTooltip({
                                    show: true,
                                    text,
                                    x: event.clientX,
                                    y: event.clientY,
                                  })
                                }
                                onMouseMove={(event) =>
                                  setTooltip((prev) => ({
                                    ...prev,
                                    x: event.clientX,
                                    y: event.clientY,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setTooltip((prev) => ({ ...prev, show: false }))
                                }
                                aria-label={text}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <button type="button" className="text-sm text-[#57606a] hover:underline">
                  Learn how we count contributions
                </button>

                <div className="flex items-center gap-1.5 text-sm text-[#57606a]">
                  <span>Less</span>
                  {HEAT_COLORS.map((color) => (
                    <span
                      key={color}
                      className={`h-2.5 w-2.5 rounded-[2px] border border-black/5 ${color}`}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="order-1 flex w-full items-start gap-2 sm:w-auto lg:order-2 lg:flex-col">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[10px] border border-[#d0d7de] bg-white px-3 py-2 text-sm text-[#57606a] lg:hidden"
            >
              Contribution settings
              <span className="text-xs">▼</span>
            </button>
            <button
              type="button"
              className="w-full rounded-[10px] bg-[#1f6feb] px-4 py-2.5 text-base font-medium text-white sm:min-w-[110px]"
            >
              {ACTIVE_YEAR}
            </button>
            <button
              type="button"
              className="w-full rounded-[10px] px-4 py-2.5 text-base text-[#57606a] hover:bg-[#eaedf1] sm:min-w-[110px]"
            >
              {ACTIVE_YEAR - 1}
            </button>
          </aside>
        </section>
      </main>

      <Tooltip state={tooltip} />
    </div>
  )
}
