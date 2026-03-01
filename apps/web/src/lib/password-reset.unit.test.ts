import { describe, expect, it } from 'vitest'
import { generatePasswordResetToken, hashPasswordResetToken } from './password-reset'

describe('password-reset utilities', () => {
  it('generates raw and hashed tokens with expiry in future', () => {
    const result = generatePasswordResetToken()

    expect(result.rawToken).toBeTruthy()
    expect(result.hashedToken).toBeTruthy()
    expect(result.rawToken).not.toEqual(result.hashedToken)
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('hashes same token deterministically', () => {
    const token = 'demo-token'
    const first = hashPasswordResetToken(token)
    const second = hashPasswordResetToken(token)

    expect(first).toEqual(second)
    expect(first).not.toEqual(token)
  })
})
