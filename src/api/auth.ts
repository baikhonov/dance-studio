import { apiRequest } from './http'

type LoginResponse = {
  token: string
}

export const loginRequest = async (password: string): Promise<string> => {
  const data = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { password },
  })
  return data.token
}
