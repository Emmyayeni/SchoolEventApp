import { resolveStoragePublicUrl, STORAGE_BUCKETS } from '../src/services/storage'
import { supabase } from './superbase'

const DEFAULT_AVATAR = ''

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
    matricNumber: (profile.matricNumber || '').trim() || null,
    staffId: (profile.staffId || '').trim() || null,
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
    id: authUser.id,
    email: authUser.email || profileRow?.email || '',
    accountType: profileRow?.account_type || profileRow?.accountType || metadata.accountType || 'student',
    accountStatus: profileRow?.account_status || 'approved',
    fullName:
      profileRow?.full_name ||
      profileRow?.fullName ||
      metadata.fullName ||
      authUser?.email?.split('@')?.[0] ||
      'NSUK User',
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

function getAdminPrivileges(role) {
  const basePrivileges = {
    canViewDashboard: false,
    canManageEvents: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
  }

  if (!role) {
    return basePrivileges
  }

  if (role === 'superadmin') {
    return {
      canViewDashboard: true,
      canManageEvents: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageSettings: true,
    }
  }

  if (role === 'moderator') {
    return {
      canViewDashboard: true,
      canManageEvents: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageSettings: false,
    }
  }

  if (role === 'viewer') {
    return {
      canViewDashboard: true,
      canManageEvents: false,
      canManageUsers: false,
      canViewAnalytics: true,
      canManageSettings: false,
    }
  }

  return basePrivileges
}

async function getUserAdminRole(userId) {
  if (!userId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.log('Admin role lookup warning:', error.message)
      return null
    }

    return data?.role || null
  } catch (error) {
    console.log('Admin role lookup error:', error?.message || error)
    return null
  }
}

async function enrichUserWithAdminInfo(user) {
  if (!user?.id) {
    return user
  }

  const role = await getUserAdminRole(user.id)
  if (!role) {
    return {
      ...user,
      role: null,
      privileges: getAdminPrivileges(null),
    }
  }

  return {
    ...user,
    accountType: 'admin',
    role,
    privileges: getAdminPrivileges(role),
  }
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

async function writeProfileRow(userId, email, normalized, avatar = '', isUpdate = false) {
  const status = (normalized.accountType === "staff" || normalized.accountType === "organizer") ? "pending" : "approved"

  const payload = {
    id: userId,
    email,
    full_name: normalized.fullName,
    account_type: normalized.accountType,
    account_status: status,
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

  // Profile editing must never reset approval or change an account's authority.
  if (isUpdate) {
    delete payload.account_type
    delete payload.account_status
  }
  const query = supabase.from('profiles')
  const { error } = await (isUpdate
    ? query.update(payload).eq('id', userId)
    : query.upsert(payload, { onConflict: 'id' }))

  if (error) {
    throw error
  }
}

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function upsertProfile(userId, email, profileInput) {
  const normalized = normalizeProfileInput(profileInput)
  const avatar = (profileInput?.avatar || '').trim()
  await writeProfileRow(userId, email, normalized, avatar)
}

function profileInputFromAuthUser(authUser) {
  const metadata = authUser?.user_metadata || {}
  return {
    accountType: metadata.accountType || 'student',
    fullName: metadata.fullName || authUser?.email?.split('@')?.[0] || '',
    department: metadata.department || '',
    level: metadata.level || '',
    faculty: metadata.faculty || '',
    matricNumber: metadata.matricNumber || '',
    staffId: metadata.staffId || '',
    roleDesignation: metadata.roleDesignation || '',
    phoneNumber: metadata.phoneNumber || metadata.phone || '',
    themeMode: metadata.themeMode || 'system',
    avatar: metadata.avatar || '',
  }
}

// Guarantee a profile row exists for an authenticated user. Safe to call on every
// sign-in: it only writes when the row is missing (for example when the account was
// created through an email-confirmation flow where signup could not write it yet).
async function ensureProfileRow(authUser, existingProfileRow) {
  if (!authUser?.id || existingProfileRow) {
    return existingProfileRow
  }

  try {
    await upsertProfile(authUser.id, authUser.email, profileInputFromAuthUser(authUser))
    return await fetchProfile(authUser.id)
  } catch (error) {
    console.log('Profile bootstrap on sign-in failed:', error?.message || error)
    throw error
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

  let profileRow = await fetchProfile(data.user.id)
  profileRow = await ensureProfileRow(data.user, profileRow)

  if (["pending", "disabled"].includes(profileRow?.account_status)) {
    await supabase.auth.signOut()
    throw new Error(profileRow.account_status === "disabled" ? "Your account has been disabled. Contact an administrator." : "Your account is pending approval from an administrator.")
  }

  const appUser = mapToAppUser(data.user, profileRow)
  const enrichedUser = await enrichUserWithAdminInfo(appUser)

  return {
    session: data.session,
    appUser: enrichedUser,
  }
}

export async function signUpWithEmailPassword({ email, password, profile }) {
  const normalized = normalizeProfileInput(profile)
  if (!['student', 'staff', 'organizer'].includes(normalized.accountType)) {
    throw new Error('Choose a valid account type.')
  }
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

  // The profile row can only be written once an authenticated session exists (RLS
  // requires auth.uid() = id). When email confirmation is required there is no
  // session yet, so the row is created on first sign-in via ensureProfileRow. The
  // profile fields are stored on the auth user (options.data) above, so nothing is
  // lost in the meantime.
  if (data.user && data.session) {
    await upsertProfile(data.user.id, email, profile)
  }

  const profileRow = data.user && data.session ? await fetchProfile(data.user.id) : null
  const requiresApproval = ['staff', 'organizer'].includes(normalized.accountType)
  if (data.session && requiresApproval) await supabase.auth.signOut()
  return {
    session: requiresApproval ? null : data.session,
    appUser: data.user ? mapToAppUser(data.user, profileRow) : null,
    requiresEmailConfirmation: !data.session,
    requiresApproval,
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

  let profileRow = await fetchProfile(data.user.id)
  profileRow = await ensureProfileRow(data.user, profileRow)

  if (["pending", "disabled"].includes(profileRow?.account_status)) {
    await supabase.auth.signOut()
    return null
  }

  const appUser = mapToAppUser(data.user, profileRow)
  return enrichUserWithAdminInfo(appUser)
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
  await writeProfileRow(data.user.id, data.user.email, normalized, avatar, true)
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
    return enrichUserWithAdminInfo(mapToAppUser(data.user, profileRow))
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

export async function resetPasswordForEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'nsuk-events://reset-password',
  })

  if (error) {
    throw error
  }
  
  return data
}

export function onAuthStateChange(callback) {
  let active = true
  let generation = 0
  const result = supabase.auth.onAuthStateChange((event, session) => {
    const currentGeneration = ++generation
    const authUser = session?.user
    if (!authUser) {
      callback(event, null, session)
      return
    }

    // Release Supabase's auth lock before making database/auth requests.
    setTimeout(async () => {
      try {
        let profileRow = await fetchProfile(authUser.id)
        profileRow = await ensureProfileRow(authUser, profileRow)
        if (!active || currentGeneration !== generation) return
        if (!profileRow || ['pending', 'disabled'].includes(profileRow.account_status)) {
          await supabase.auth.signOut()
          return
        }
        const enrichedUser = await enrichUserWithAdminInfo(mapToAppUser(authUser, profileRow))
        if (active && currentGeneration === generation) callback(event, enrichedUser, session)
      } catch (error) {
        console.log('Auth state refresh failed:', error?.message || error)
      }
    }, 0)
  })
  return { data: { subscription: { unsubscribe() {
    active = false
    generation += 1
    result.data.subscription.unsubscribe()
  } } } }
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
