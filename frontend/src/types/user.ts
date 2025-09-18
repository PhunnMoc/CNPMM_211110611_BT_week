export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string | null
  phone?: string
  isAdmin?: boolean
}

export interface LoginRequest { email: string; password: string }
export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}
export interface LoginResponse { token: string; user: User }


