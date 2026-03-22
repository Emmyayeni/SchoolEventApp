import { resolveStoragePublicUrl, STORAGE_BUCKETS } from '../src/services/storage'
import { supabase } from './superbase'

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80'

function normalizeThemeMode(value) {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value
  }
  return 'system'
}

function normalizeProfileInput(profile = {}) {
  const accountType = profile.accountType || 'student'
  const roleLevel = accountType === 'staff' ? profile.roleDesignation : profile.level

  return {
    accountType,
    fullName: (profile.fullName || '').trim(),
    department: (profile.department || '').trim(),
    level: (roleLevel || '').trim(),
    faculty: (profile.faculty || '').trim(),
    matricNumber: (profile.matricNumber || '').trim(),
    staffId: (profile.staffId || '').trim(),
    roleDesignation: (profile.roleDesignation || '').trim(),
    phoneNumber: (profile.phoneNumber || profile.phone_number || profile.phone || '').trim(),
    themeMode: normalizeThemeMode(profile.themeMode || profile.theme_mode),
  }
}

function mapToAppUser(authUser, profileRow = null) {
  const metadata = authUser?.user_metadata || {}
  const avatarValue =
    profileRow?.avatar_url || profileRow?.avatarUrl || profileRow?.avatar || metadata.avatar

  return {
    id: authUser?.id || profileRow?.id || '',
    accountType: profileRow?.account_type || profileRow?.accountType || metadata.accountType || 'student',
    fullName:
      profileRow?.full_name ||
      profileRow?.fullName ||
      metadata.fullName ||
      authUser?.email?.split('@')?.[0] ||
      'NSUK User',
    email: authUser?.email || profileRow?.email || '',
    department: profileRow?.department || metadata.department || '',
    level:
      profileRow?.level || metadata.level || metadata.roleDesignation || '',
    faculty: profileRow?.faculty || metadata.faculty || '',
    matricNumber: profileRow?.matric_number || profileRow?.matricNumber || metadata.matricNumber || '',
    staffId: profileRow?.staff_id || profileRow?.staffId || metadata.staffId || '',
    roleDesignation:
      profileRow?.role_designation || profileRow?.roleDesignation || metadata.roleDesignation || '',
    phoneNumber: profileRow?.phone_number || metadata.phoneNumber || metadata.phone || '',
    avatar: resolveStoragePublicUrl(avatarValue, STORAGE_BUCKETS.avatars, DEFAULT_AVATAR),
    themeMode: normalizeThemeMode(
      profileRow?.theme_mode || profileRow?.themeMode || metadata.themeMode || metadata.theme_mode
    ),
  }
}

function isMissingColumnError(error, columnName) {
  const message = (error?.message || '').toLowerCase()
  return message.includes(`could not find the '${columnName.toLowerCase()}' column`) || message.includes(columnName.toLowerCase())
}

function hasSchemaColumnError(error) {
  const message = (error?.message || '').toLowerCase()
  return message.includes('could not find the') && message.includes('column')
}

async function withTimeout(promise, timeoutMs, label) {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
  }
}

async function upsertProfileFlexible(userId, email, normalized, avatar = '') {
  const snakePayload = {
    id: userId,
    email,
    full_name: normalized.fullName,
    account_type: normalized.accountType,
    department: normalized.department,
    level: normalized.level,
    faculty: normalized.faculty,
    matric_number: normalized.matricNumber,
    staff_id: normalized.staffId,
    role_designation: normalized.roleDesignation,
    phone_number: normalized.phoneNumber,
    theme_mode: normalizeThemeMode(normalized.themeMode),
    avatar_url: avatar || DEFAULT_AVATAR,
  }

  const camelPayload = {
    id: userId,
    email,
    fullName: normalized.fullName,
    accountType: normalized.accountType,
    department: normalized.department,
    level: normalized.level,
    faculty: normalized.faculty,
    matricNumber: normalized.matricNumber,
    staffId: normalized.staffId,
    roleDesignation: normalized.roleDesignation,
    phoneNumber: normalized.phoneNumber,
    themeMode: normalizeThemeMode(normalized.themeMode),
    avatar: avatar || DEFAULT_AVATAR,
  }

  const camelPayloadNoAvatar = {
    id: userId,
    email,
    fullName: normalized.fullName,
    accountType: normalized.accountType,
    department: normalized.department,
    level: normalized.level,
    faculty: normalized.faculty,
    matricNumber: normalized.matricNumber,
    staffId: normalized.staffId,
    roleDesignation: normalized.roleDesignation,
    phoneNumber: normalized.phoneNumber,
    themeMode: normalizeThemeMode(normalized.themeMode),
  }

  const snakePayloadNoAvatar = {
    id: userId,
    email,
    full_name: normalized.fullName,
    account_type: normalized.accountType,
    department: normalized.department,
    level: normalized.level,
    faculty: normalized.faculty,
    matric_number: normalized.matricNumber,
    staff_id: normalized.staffId,
    role_designation: normalized.roleDesignation,
    phone_number: normalized.phoneNumber,
    theme_mode: normalizeThemeMode(normalized.themeMode),
  }

  const attempts = [snakePayload, camelPayload, camelPayloadNoAvatar, snakePayloadNoAvatar]
  let lastError = null

  for (const payload of attempts) {
    const { error: writeError } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    if (!writeError) {
      return
    }

    lastError = writeError

    // Stop early for non-schema failures (for example RLS/network errors).
    if (!hasSchemaColumnError(writeError) && !isMissingColumnError(writeError, 'account_type')) {
      throw writeError
    }
  }

  if (lastError) {
    throw lastError
  }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

async function upsertProfile(userId, email, profileInput) {
  const normalized = normalizeProfileInput(profileInput)
  const avatar = (profileInput?.avatar || '').trim()

  try {
    await upsertProfileFlexible(userId, email, normalized, avatar)
  } catch (error) {
    console.log('Profile upsert error:', error.message)
  }
}

export async function signInWithEmailPassword({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  const profileRow = await fetchProfile(data.user.id)
  return {
    session: data.session,
    appUser: mapToAppUser(data.user, profileRow),
  }
}

export async function signUpWithEmailPassword({ email, password, profile }) {
  const normalized = normalizeProfileInput(profile)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...normalized,
      },
    },
  })

  if (error) {
    throw error
  }

  if (data.user) {
    await upsertProfile(data.user.id, email, profile)
  }

  const profileRow = data.user ? await fetchProfile(data.user.id) : null
  return {
    session: data.session,
    appUser: data.user ? mapToAppUser(data.user, profileRow) : null,
    requiresEmailConfirmation: !data.session,
  }
}

export async function getCurrentAppUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!data?.user) {
    return null
  }

  const profileRow = await fetchProfile(data.user.id)
  return mapToAppUser(data.user, profileRow)
}

export async function updateCurrentUserProfile(profile = {}) {
  const totalStartedAt = Date.now()
  console.log('[auth.profile] update started')

  const authStartedAt = Date.now()
  const { data, error } = await supabase.auth.getUser()
  console.log('[auth.profile] auth.getUser done', { durationMs: Date.now() - authStartedAt })

  if (error) {
    throw error
  }

  if (!data?.user) {
    throw new Error('No authenticated user found.')
  }

  const normalized = normalizeProfileInput(profile)
  const avatar = (profile.avatar || '').trim()

  const upsertStartedAt = Date.now()
  await upsertProfileFlexible(data.user.id, data.user.email, normalized, avatar)
  console.log('[auth.profile] profiles upsert done', { durationMs: Date.now() - upsertStartedAt })

  try {
    const metadataStartedAt = Date.now()
    const { error: metadataError } = await withTimeout(
      supabase.auth.updateUser({
        data: {
          ...normalized,
          avatar: avatar || DEFAULT_AVATAR,
          themeMode: normalizeThemeMode(normalized.themeMode),
        },
      }),
      5000,
      'auth.updateUser'
    )
    console.log('[auth.profile] auth.updateUser done', { durationMs: Date.now() - metadataStartedAt })

    if (metadataError) {
      console.log('Profile metadata update warning:', metadataError.message)
    }
  } catch (metadataTimeoutError) {
    console.log('Profile metadata update timeout warning:', metadataTimeoutError?.message || metadataTimeoutError)
  }

  try {
    const fetchProfileStartedAt = Date.now()
    const profileRow = await withTimeout(fetchProfile(data.user.id), 5000, 'fetchProfile')
    console.log('[auth.profile] fetchProfile done', { durationMs: Date.now() - fetchProfileStartedAt })
    console.log('[auth.profile] update completed', { durationMs: Date.now() - totalStartedAt })
    return mapToAppUser(data.user, profileRow)
  } catch (fetchTimeoutError) {
    console.log('Profile fetch timeout warning:', fetchTimeoutError?.message || fetchTimeoutError)
    console.log('[auth.profile] update completed with fallback', { durationMs: Date.now() - totalStartedAt })
    return {
      id: data.user.id,
      accountType: normalized.accountType || 'student',
      fullName: normalized.fullName || data.user.email?.split('@')?.[0] || 'NSUK User',
      email: data.user.email || '',
      department: normalized.department || '',
      level: normalized.level || normalized.roleDesignation || '',
      faculty: normalized.faculty || '',
      matricNumber: normalized.matricNumber || '',
      staffId: normalized.staffId || '',
      roleDesignation: normalized.roleDesignation || '',
      phoneNumber: normalized.phoneNumber || '',
      avatar: avatar || DEFAULT_AVATAR,
      themeMode: normalizeThemeMode(normalized.themeMode),
    }
  }
}

export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    const authUser = session?.user
    if (!authUser) {
      callback(event, null, session)
      return
    }

    const profileRow = await fetchProfile(authUser.id)
    callback(event, mapToAppUser(authUser, profileRow), session)
  })
}

export function getAuthErrorMessage(error) {
  const message = error?.message || 'Authentication failed. Please try again.'

  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password.'
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Please verify your email before logging in.'
  }

  return message
}