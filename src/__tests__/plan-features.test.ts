import { describe, it, expect } from 'vitest'
import { canAccessPage, requiredPlanForPage } from '@/lib/plan-features'

describe('canAccessPage', () => {
  it('Starter can access /dashboard', () => {
    expect(canAccessPage('Starter', '/dashboard')).toBe(true)
  })
  it('Starter cannot access /dashboard/sessions', () => {
    expect(canAccessPage('Starter', '/dashboard/sessions')).toBe(false)
  })
  it('Pro can access /dashboard/sessions', () => {
    expect(canAccessPage('Pro', '/dashboard/sessions')).toBe(true)
  })
  it('Pro cannot access /dashboard/audit', () => {
    expect(canAccessPage('Pro', '/dashboard/audit')).toBe(false)
  })
  it('Business can access /dashboard/audit', () => {
    expect(canAccessPage('Business', '/dashboard/audit')).toBe(true)
  })
  it('Enterprise can access all pages', () => {
    expect(canAccessPage('Enterprise', '/dashboard/export')).toBe(true)
  })
  it('Trial can access all pages', () => {
    expect(canAccessPage('Trial', '/dashboard/training-centers')).toBe(true)
  })
  it('null plan cannot access restricted pages', () => {
    expect(canAccessPage(null, '/dashboard/sessions')).toBe(false)
  })
  it('null plan can access base pages', () => {
    expect(canAccessPage(null, '/dashboard')).toBe(true)
  })
})

describe('requiredPlanForPage', () => {
  it('returns null for Starter pages', () => {
    expect(requiredPlanForPage('/dashboard/employees')).toBeNull()
  })
  it('returns Pro for sessions', () => {
    expect(requiredPlanForPage('/dashboard/sessions')).toBe('Pro')
  })
  it('returns Business for audit', () => {
    expect(requiredPlanForPage('/dashboard/audit')).toBe('Business')
  })
})