import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Trip, BnoData } from '../../lib/bno/types'
import { calculate, type ChartOptions } from '../../lib/bno/calculator'
import {
  loadProfiles, saveProfiles,
  addProfile, removeProfile, renameProfile, updateProfileData, duplicateProfile, addProfileWithData,
} from '../../lib/bno/profiles'
import ProfileSwitcher from '../bno/ProfileSwitcher'
import TripForm from '../bno/TripForm'
import TripList from '../bno/TripList'
import StatusCards from '../bno/StatusCards'
import AbsenceChart from '../bno/AbsenceChart'
import CsvHandler from '../bno/CsvHandler'
import FullBackup from '../bno/FullBackup'
import WhatIfSimulator from '../bno/WhatIfSimulator'
import Checklist from '../bno/Checklist'
import MilestoneRibbon from '../bno/MilestoneRibbon'
import FamilyOverview from '../bno/FamilyOverview'
import type { UkVisaConfig } from './config'

interface Props {
  config: UkVisaConfig
}

export default function UkLongStayPage({ config }: Props) {
  const { t } = useTranslation()

  const loadFn = useCallback(() => loadProfiles(config.storageKey), [config.storageKey])
  const [store, setStore] = useState(loadFn)
  const [showForm, setShowForm] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [chartOpts, setChartOpts] = useState<ChartOptions>({ horizonMonths: 0 })
  const [pendingShare, setPendingShare] = useState<BnoData | null>(null)

  // Reset state when visa type changes (storageKey changes)
  useEffect(() => {
    setStore(loadProfiles(config.storageKey))
    setShowForm(false)
    setChartOpts({ horizonMonths: 0 })
  }, [config.storageKey])

  useEffect(() => { saveProfiles(store, config.storageKey) }, [store, config.storageKey])

  // Handle incoming share link: ?share=BASE64
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareParam = params.get('share')
    if (shareParam) {
      try {
        const shareData = JSON.parse(decodeURIComponent(atob(shareParam))) as BnoData
        if (shareData.arrivalDate) setPendingShare(shareData)
      } catch { /* invalid share link */ }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const activeProfile = store.profiles[store.activeId]
  const rawData: BnoData = activeProfile?.data ?? { approvalDate: '', arrivalDate: '', trips: [] }
  // For visa types that force LOTR mode, always use isLOTR=true in calc
  const data: BnoData = config.forceIsLOTR ? { ...rawData, isLOTR: true } : rawData

  function updateData(updater: (prev: BnoData) => BnoData) {
    setStore(prev => {
      const profile = prev.profiles[prev.activeId]
      if (!profile) return prev
      return updateProfileData(prev, prev.activeId, updater(profile.data))
    })
  }

  function handleSwitch(id: string) {
    setStore(prev => ({ ...prev, activeId: id }))
    setShowForm(false)
    setChartOpts({ horizonMonths: 0 })
  }

  function addTrip(tripData: Omit<Trip, 'id'>) {
    const trip: Trip = { ...tripData, id: crypto.randomUUID() }
    updateData(prev => ({ ...prev, trips: [...prev.trips, trip] }))
    setShowForm(false)
  }

  function updateTrip(id: string, tripData: Omit<Trip, 'id'>) {
    updateData(prev => ({
      ...prev,
      trips: prev.trips.map(t => t.id === id ? { ...tripData, id } : t),
    }))
  }

  function deleteTrip(id: string) {
    updateData(prev => ({ ...prev, trips: prev.trips.filter(t => t.id !== id) }))
  }

  function handleImportAsNew(importedData: BnoData, name: string) {
    setStore(prev => addProfileWithData(prev, name, importedData))
  }

  function handleRestoreAll(restoredStore: typeof store) {
    setStore(restoredStore)
  }

  const calc = useMemo(() => {
    if (!data.arrivalDate || data.arrivalDate.length < 10) return null
    try {
      return calculate(data.arrivalDate, data.trips, chartOpts, data.approvalDate, data.isLOTR)
    } catch { return null }
  }, [data, chartOpts])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
          {config.icon} {t(config.titleKey)}
        </h1>
        <p className="text-slate-500 text-sm">{t(config.subtitleKey)}</p>
      </div>

      {/* Incoming share banner */}
      {pendingShare && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">🔗 {t('bno.csv.shareReceived')}</p>
            <p className="text-xs text-blue-600 mt-0.5">{t('bno.csv.shareReceivedDesc')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const name = window.prompt(t('profile.newNamePrompt'), t('bno.csv.shareDefaultName')) ?? ''
                if (name.trim()) setStore(prev => addProfileWithData(prev, name.trim(), pendingShare))
                setPendingShare(null)
              }}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('bno.csv.shareImport')}
            </button>
            <button
              onClick={() => setPendingShare(null)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('bno.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Profile switcher */}
      <ProfileSwitcher
        store={store}
        onSwitch={handleSwitch}
        onAdd={name => setStore(prev => addProfile(prev, name))}
        onDelete={id => setStore(prev => removeProfile(prev, id))}
        onRename={(id, name) => setStore(prev => renameProfile(prev, id, name))}
        onDuplicate={id => setStore(prev => duplicateProfile(prev, id, t('profile.duplicateSuffix')))}
        csvSlot={
          <CsvHandler
            trips={data.trips}
            approvalDate={data.approvalDate}
            arrivalDate={data.arrivalDate}
            profileName={activeProfile?.name ?? ''}
            onImportAsNew={handleImportAsNew}
          />
        }
      />

      {/* Dates section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        {config.showBnoFields && (
          <>
            <label className="flex items-center gap-2.5 mb-4 cursor-pointer w-fit group">
              <input
                type="checkbox"
                checked={rawData.isLOTR ?? false}
                onChange={e => updateData(prev => ({ ...prev, isLOTR: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 select-none">
                {t('bno.isLOTR')}
              </span>
            </label>
            {rawData.isLOTR && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-4">
                {t('bno.isLOTRHint')}
              </p>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-4 items-end">
          {config.showBnoFields && !rawData.isLOTR && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                  1️⃣ {t('bno.approvalDate')}
                </label>
                <input
                  type="date"
                  value={rawData.approvalDate}
                  onChange={e => updateData(prev => ({ ...prev, approvalDate: e.target.value }))}
                  className={`border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.ringColor} focus:border-transparent`}
                />
              </div>
              <div className="text-slate-300 text-lg self-center pb-1">→</div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
              {config.showBnoFields && !rawData.isLOTR ? '2️⃣' : '1️⃣'} {t(config.startDateLabelKey)}
            </label>
            <input
              type="date"
              value={rawData.arrivalDate}
              min={config.showBnoFields && !rawData.isLOTR ? (rawData.approvalDate || undefined) : undefined}
              onChange={e => updateData(prev => ({ ...prev, arrivalDate: e.target.value }))}
              className={`border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${config.ringColor} focus:border-transparent`}
            />
          </div>
        </div>
        {config.showBnoFields && !rawData.isLOTR && rawData.approvalDate && rawData.arrivalDate && (
          <p className="text-xs text-slate-400 mt-3">{t('bno.approvalDateHint')}</p>
        )}
      </div>

      {/* Family overview */}
      <FamilyOverview store={store} activeId={store.activeId} onSwitch={handleSwitch} />

      {/* Milestone ribbon */}
      {calc && <MilestoneRibbon calc={calc} />}

      {/* Main layout: 2-col on desktop */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Trip management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              {config.showBnoFields ? '3️⃣' : '2️⃣'} {t('bno.tripList')}
              {data.trips.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">({data.trips.length})</span>
              )}
            </h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + {t('bno.addTrip')}
              </button>
            )}
          </div>
          {showForm && <TripForm onSave={addTrip} onCancel={() => setShowForm(false)} />}
          <TripList trips={data.trips} onUpdate={updateTrip} onDelete={deleteTrip} />
        </div>

        {/* Right: Status + Chart */}
        <div className="space-y-4">
          {calc ? (
            <>
              <StatusCards calc={calc} />
              {calc.rollingData.length > 0 && (
                <AbsenceChart
                  data={calc.rollingData}
                  ilrDate={calc.ilr.eligibleDate.toISOString().split('T')[0]}
                  citizenshipDate={calc.citizenship.eligibleDate.toISOString().split('T')[0]}
                  chartOpts={chartOpts}
                  onOptsChange={setChartOpts}
                />
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm">{t('bno.enterArrivalDate')}</p>
            </div>
          )}
        </div>
      </div>

      {/* What-if simulator */}
      {calc && (
        <div className="mt-6">
          <WhatIfSimulator data={data} currentCalc={calc} />
        </div>
      )}

      {/* Checklist */}
      <div className="mt-6">
        <Checklist storageKey={config.checklistKey} visaType={config.checklistType} />
      </div>

      {/* Rules section */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowRules(v => !v)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-amber-100 transition-colors"
        >
          <span className="text-sm font-medium text-amber-800">⚖️ {t('bno.rules.title')}</span>
          <span className="text-amber-600 text-sm">{showRules ? '▲' : '▼'}</span>
        </button>
        {showRules && (
          <div className="px-5 pb-5 space-y-2">
            {(['rule1', 'rule2', 'rule3', 'rule4'] as const).map(key => (
              <p key={key} className="text-xs text-amber-700 flex gap-2">
                <span>•</span><span>{t(`bno.rules.${key}`)}</span>
              </p>
            ))}
            <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap items-center gap-3">
              <span className="text-xs text-amber-600">{t('bno.rules.source')}：</span>
              {config.ruleLinks.map(link => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
                >
                  {t(link.labelKey)} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full backup */}
      <FullBackup store={store} onRestoreAll={handleRestoreAll} t={t} />
    </div>
  )
}
