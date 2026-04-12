/**
 * Generate and download an .ics calendar event file.
 * Works with Apple Calendar, Google Calendar, Outlook, etc.
 */
export function downloadIcs({
  summary,
  description,
  date,         // YYYY-MM-DD
  uid,
}: {
  summary: string
  description: string
  date: string
  uid: string
}) {
  // Format date as YYYYMMDD (all-day event)
  const dtDate = date.replace(/-/g, '')
  // Next day for DTEND (all-day events are exclusive end)
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)
  const dtEnd = nextDay.toISOString().slice(0, 10).replace(/-/g, '')

  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VisaPath//BNO Calculator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@visapath`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${dtDate}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${uid}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
