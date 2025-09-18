import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser, 
  setAvatar 
} from '../store/slices/authSlice'
import { 
  useLoginMutation, 
  useRegisterMutation, 
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserAvatarMutation 
} from '../store/api/api'
import { showToast } from '../utils/toast'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()
  const auth = useSelector((state: RootState) => state.auth)
  
  const [loginMutation] = useLoginMutation()
  const [registerMutation] = useRegisterMutation()
  const [updateProfileMutation] = useUpdateUserProfileMutation()
  const [updateAvatarMutation] = useUpdateUserAvatarMutation()
  
  const { data: userProfile, refetch: refetchProfile } = useGetUserProfileQuery(undefined, {
    skip: !auth.isAuthenticated,
  })

  // Keep Redux user state in sync with latest profile (including avatar)
  useEffect(() => {
    if (userProfile) {
      const normalized = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        firstName: userProfile.first_name ?? userProfile.firstName,
        lastName: userProfile.last_name ?? userProfile.lastName,
        phone: userProfile.phone,
        avatarUrl: userProfile.avatar_url ?? userProfile.avatarUrl ?? null,
        isAdmin: userProfile.is_admin ?? userProfile.isAdmin,
      }
      dispatch(updateUser(normalized))
    }
  }, [userProfile, dispatch])

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch(loginStart())
      const result = await loginMutation({ email, password }).unwrap()
      dispatch(loginSuccess(result))
      showToast.success('Login successful!')
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Login failed'
      dispatch(loginFailure(message))
      showToast.error(message)
      throw error
    }
  }, [dispatch, loginMutation])

  const register = useCallback(async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    try {
      dispatch(loginStart())
      const result = await registerMutation(userData).unwrap()
      dispatch(loginSuccess(result))
      showToast.success('Registration successful!')
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Registration failed'
      dispatch(loginFailure(message))
      showToast.error(message)
      throw error
    }
  }, [dispatch, registerMutation])

  const logoutUser = useCallback(() => {
    dispatch(logout())
    showToast.info('Logged out successfully')
  }, [dispatch])

  const updateProfile = useCallback(async (userData: Partial<{
    firstName: string
    lastName: string
    phone?: string
  }>) => {
    try {
      const result = await updateProfileMutation(userData).unwrap()
      dispatch(updateUser(result))
      showToast.success('Profile updated successfully!')
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Profile update failed'
      showToast.error(message)
      throw error
    }
  }, [dispatch, updateProfileMutation])

  const updateAvatar = useCallback(async (avatarUrl: string) => {
    try {
      const result = await updateAvatarMutation({ avatarUrl }).unwrap()
      dispatch(setAvatar(avatarUrl))
      showToast.success('Avatar updated successfully!')
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Avatar update failed'
      showToast.error(message)
      throw error
    }
  }, [dispatch, updateAvatarMutation])

  return {
    // State
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    
    // Actions
    login,
    register,
    logout: logoutUser,
    updateProfile,
    updateAvatar,
    refetchProfile,
    
    // Computed
    isAdmin: auth.user?.isAdmin || false,
    fullName: auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : '',
  }
}
