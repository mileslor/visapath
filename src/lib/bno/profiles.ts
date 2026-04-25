import type { BnoData, Profile, ProfileStore } from './types'

export const BNO_STORAGE_KEY = 'visapath-profiles'
const LEGACY_KEY = 'visapath-bno-data'

function emptyData(): BnoData {
  return { approvalDate: '', arrivalDate: '', isLOTR: false, trips: [] }
}

function createProfile(name: string): Profile {
  return { id: crypto.randomUUID(), name, data: emptyData() }
}

export function loadProfiles(storageKey = BNO_STORAGE_KEY): ProfileStore {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const store = JSON.parse(raw) as ProfileStore
      if (store.profiles && store.activeId && store.profiles[store.activeId]) return store
    }
  } catch { /* ignore */ }

  // Migrate legacy single-profile data (BNO only)
  if (storageKey === BNO_STORAGE_KEY) {
    try {
      const legacy = localStorage.getItem(LEGACY_KEY)
      if (legacy) {
        const bnoData = JSON.parse(legacy) as BnoData
        const profile: Profile = { id: crypto.randomUUID(), name: '成員 A', data: bnoData }
        return { activeId: profile.id, profiles: { [profile.id]: profile } }
      }
    } catch { /* ignore */ }
  }

  const profile = createProfile('成員 A')
  return { activeId: profile.id, profiles: { [profile.id]: profile } }
}

export function saveProfiles(store: ProfileStore, storageKey = BNO_STORAGE_KEY): void {
  localStorage.setItem(storageKey, JSON.stringify(store))
}

export function addProfile(store: ProfileStore, name: string): ProfileStore {
  const profile = createProfile(name)
  return { activeId: profile.id, profiles: { ...store.profiles, [profile.id]: profile } }
}

export function removeProfile(store: ProfileStore, id: string): ProfileStore {
  const remaining = { ...store.profiles }
  delete remaining[id]
  const ids = Object.keys(remaining)
  if (ids.length === 0) {
    const profile = createProfile('成員 A')
    return { activeId: profile.id, profiles: { [profile.id]: profile } }
  }
  const newActiveId = id === store.activeId ? ids[0] : store.activeId
  return { activeId: newActiveId, profiles: remaining }
}

export function renameProfile(store: ProfileStore, id: string, name: string): ProfileStore {
  const profile = store.profiles[id]
  if (!profile) return store
  return { ...store, profiles: { ...store.profiles, [id]: { ...profile, name } } }
}

export function updateProfileData(store: ProfileStore, id: string, data: BnoData): ProfileStore {
  const profile = store.profiles[id]
  if (!profile) return store
  return { ...store, profiles: { ...store.profiles, [id]: { ...profile, data } } }
}

export function addProfileWithData(store: ProfileStore, name: string, data: BnoData): ProfileStore {
  const id = crypto.randomUUID()
  const profile: Profile = {
    id,
    name,
    data: {
      approvalDate: data.approvalDate || '',
      arrivalDate: data.arrivalDate || '',
      isLOTR: data.isLOTR ?? false,
      trips: data.trips.map(t => ({ ...t, id: crypto.randomUUID() })),
    },
  }
  return { activeId: id, profiles: { ...store.profiles, [id]: profile } }
}

export function duplicateProfile(store: ProfileStore, sourceId: string, nameSuffix: string): ProfileStore {
  const source = store.profiles[sourceId]
  if (!source) return store
  const newProfile: Profile = {
    id: crypto.randomUUID(),
    name: `${source.name}${nameSuffix}`,
    data: {
      approvalDate: source.data.approvalDate,
      arrivalDate: source.data.arrivalDate,
      isLOTR: source.data.isLOTR ?? false,
      trips: source.data.trips.map(t => ({ ...t, id: crypto.randomUUID() })),
    },
  }
  return { activeId: newProfile.id, profiles: { ...store.profiles, [newProfile.id]: newProfile } }
}
