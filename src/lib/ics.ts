interface IcsEvent {
  summary: string
  description: string
  date: string   // YYYY-MM-DD
  uid: string
}

function buildVEvent(event: IcsEvent, now: string): string {
  const dtDate = event.date.replace(/-/g, '')
  const nextDay = new Date(event.date)
  nextDay.setDate(nextDay.getDate() + 1)
  const dtEnd = nextDay.toISOString().slice(0, 10).replace(/-/g, '')
  return [
    'BEGIN:VEVENT',
    `UID:${event.uid}@visapath`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtDate}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
  ].join('\r\n')
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadIcs(event: IcsEvent) {
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VisaPath//BNO Calculator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    buildVEvent(event, now),
    'END:VCALENDAR',
  ].join('\r\n')
  triggerDownload(ics, `${event.uid}.ics`)
}

export function downloadMultipleIcs(events: IcsEvent[], filename: string) {
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const vEvents = events.map(e => buildVEvent(e, now)).join('\r\n')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VisaPath//BNO Calculator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    vEvents,
    'END:VCALENDAR',
  ].join('\r\n')
  triggerDownload(ics, filename)
}
