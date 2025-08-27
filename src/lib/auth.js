// File: src/lib/auth.js
export function getToken() {
    if (typeof window === 'undefined') return null

    const auth = localStorage.getItem('auth_token')
    if (!auth) return null

    const { token, expiry } = JSON.parse(auth)
    
    if (new Date().getTime() > expiry) {
        localStorage.removeItem('auth_token')
        return null
    }

    return token
}