import {postRequest} from "@/api/request"

export function loginWithPassword(username, password) {
  return postRequest('/login', {username, password})
}

export function loginWithEmail(email, code) {
  return postRequest('/login', {email, code})
}

export function sendEmailCode(email) {
  return postRequest('/profile/sendEmailCode', {email})
}
