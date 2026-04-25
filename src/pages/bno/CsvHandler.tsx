import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Papa from 'papaparse'
import QRCode from 'qrcode'
import type { Trip, BnoData } from '../../lib/bno/types'

interface Props {
  trips: Trip[]
  approvalDate: string
  arrivalDate: string
  profileName: string
  onImportAsNew: (data: BnoData, name: string) => void
}

interface CsvRow {
  departure_date?: string
  return_date?: string
  destination?: string
  notes?: string
}

function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 2 })
    }
  }, [url])

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => prompt(t('bno.csv.sharePrompt'), url))
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{t('bno.csv.share')}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="flex justify-center mb-4">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <p className="text-xs text-slate-500 mb-3 text-center">{t('bno.csv.shareQrHint')}</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 bg-slate-50 truncate"
          />
          <button
            onClick={copyLink}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {copied ? '✓' : t('bno.csv.copy')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CsvHandler({ trips, approvalDate, arrivalDate, profileName, onImportAsNew }: Props) {
  const { t } = useTranslation()
  const csvFileRef = useRef<HTMLInputElement>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  function handleExportCsv() {
    const rows = trips.map(trip => ({
      departure_date: trip.departureDate,
      return_date: trip.returnDate,
      destination: trip.destination ?? '',
      notes: trip.notes ?? '',
    }))
    const meta = [{ departure_date: '# VisaPath BNO Export', return_date: `approval=${approvalDate}|arrival=${arrivalDate}`, destination: '', notes: '' }]
    const csv = Papa.unparse([...meta, ...rows])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = profileName.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '-')
    link.download = `visapath-${safeName}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const imported: Trip[] = []
        let importedApproval = ''
        let importedArrival = ''

        for (const row of results.data) {
          if (!row.departure_date) continue
          if (row.departure_date.startsWith('#')) {
            const meta = row.return_date ?? ''
            const approvalMatch = meta.match(/approval=(\d{4}-\d{2}-\d{2})/)
            const arrivalMatch = meta.match(/arrival=(\d{4}-\d{2}-\d{2})/)
            if (approvalMatch) importedApproval = approvalMatch[1]
            if (arrivalMatch) importedArrival = arrivalMatch[1]
            continue
          }
          if (!row.return_date) continue
          const dep = row.departure_date.trim()
          const ret = row.return_date.trim()
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dep) || !/^\d{4}-\d{2}-\d{2}$/.test(ret)) continue
          if (ret <= dep) continue
          imported.push({
            id: crypto.randomUUID(),
            departureDate: dep,
            returnDate: ret,
            destination: row.destination?.trim() || undefined,
            notes: row.notes?.trim() || undefined,
          })
        }

        if (imported.length === 0) {
          alert(t('bno.csv.importError'))
        } else {
          const defaultName = file.name.replace(/\.csv$/i, '').replace(/^visapath-/, '').replace(/-\d{4}-\d{2}-\d{2}$/, '') || t('bno.csv.shareDefaultName')
          const name = window.prompt(t('profile.newNamePrompt'), defaultName)
          if (name?.trim()) {
            onImportAsNew({ approvalDate: importedApproval, arrivalDate: importedArrival, trips: imported }, name.trim())
            alert(t('bno.csv.importSuccess').replace('{n}', String(imported.length)))
          }
        }
      },
      error() { alert(t('bno.csv.importError')) },
    })
    e.target.value = ''
  }

  function handleShare() {
    try {
      const shareData = { approvalDate, arrivalDate, trips }
      const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)))
      const url = `${window.location.origin}/bno?share=${encoded}`
      setShareUrl(url)
    } catch {
      alert(t('bno.csv.importError'))
    }
  }

  return (
    <>
      {shareUrl && <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />}
    <div className="flex items-center gap-2 flex-wrap">
      <input ref={csvFileRef} type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
      <button
        onClick={handleExportCsv}
        disabled={trips.length === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        📤 {t('bno.csv.export')}
      </button>
      <button
        onClick={() => csvFileRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        📥 {t('bno.csv.import')}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        🔗 {t('bno.csv.share')}
      </button>
    </div>
    </>
  )
}
