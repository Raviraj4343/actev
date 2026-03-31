const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/v1'

async function request(path, { method = 'GET', body, token, headers = {} } = {}){
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include'
  }
  if (body) init.body = JSON.stringify(body)
  if (token) init.headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, init)
  const data = await res.json().catch(()=>null)
  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed')
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

export async function login({ email, password }){
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

export async function getMe(token){
  return request('/auth/me', { method: 'GET', token })
}

export function saveToken(token){
  try{ localStorage.setItem('aqtev_access', token) }catch{}
}

export function readToken(){
  try{ return localStorage.getItem('aqtev_access') }catch{ return null }
}

export default { request, login, getMe, saveToken, readToken }
