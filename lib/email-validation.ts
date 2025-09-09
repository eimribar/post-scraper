// List of personal email domains to block
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',
  'yahoo.ca',
  'yahoo.com.au',
  'yahoo.co.in',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'tutanota.com',
  'zoho.com',
  'yandex.com',
  'mail.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'hushmail.com',
  'rocketmail.com',
  'att.net',
  'verizon.net',
  'comcast.net',
  'cox.net',
  'earthlink.net',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'rediffmail.com'
]

/**
 * Check if an email is a work email (not a personal email)
 * @param email - The email address to validate
 * @returns true if it's a work email, false if it's a personal email
 */
export function isWorkEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailLower = email.toLowerCase().trim()
  const domain = emailLower.split('@')[1]

  if (!domain) {
    return false
  }

  // Check if the domain is in the personal email list
  return !PERSONAL_EMAIL_DOMAINS.includes(domain)
}

/**
 * Get error message for invalid work email
 * @returns Error message string
 */
export function getWorkEmailErrorMessage(): string {
  return 'Please use your work email address. Personal email addresses (Gmail, Yahoo, Outlook, etc.) are not allowed.'
}