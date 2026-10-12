#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const requiredNodeMajor = 22

function fail(message) {
  console.error(`\n[preflight] ERROR: ${message}`)
  process.exitCode = 1
}

function warn(message) {
  console.warn(`[preflight] WARN: ${message}`)
}

function ok(message) {
  console.log(`[preflight] OK: ${message}`)
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath))
}

const currentNodeMajor = Number(process.versions.node.split('.')[0])
if (currentNodeMajor !== requiredNodeMajor) {
  fail(`Node ${requiredNodeMajor}.x is required. Current version is ${process.versions.node}.`)
} else {
  ok(`Node version ${process.versions.node}`)
}

if (!fileExists('pnpm-workspace.yaml')) {
  fail('Missing pnpm-workspace.yaml at repository root.')
} else {
  ok('pnpm workspace detected')
}

const envChecks = [
  {
    file: 'frontend/.env.local',
    requiredKeys: [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_API_READ_TOKEN',
    ],
  },
  {
    file: 'studio/.env.local',
    requiredKeys: ['SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET'],
  },
]

for (const check of envChecks) {
  if (!fileExists(check.file)) {
    fail(`Missing ${check.file}. Copy from the corresponding .env.example and fill values.`)
    continue
  }

  const contents = fs.readFileSync(path.join(projectRoot, check.file), 'utf8')
  const missing = check.requiredKeys.filter((key) => {
    const match = contents.match(new RegExp(`^${key}=(.*)$`, 'm'))
    if (!match) return true
    const value = (match[1] || '').trim()
    return value.length === 0 || value.startsWith('"<') || value.includes('paste your')
  })

  if (missing.length > 0) {
    fail(`${check.file} is missing required values: ${missing.join(', ')}`)
  } else {
    ok(`${check.file} required keys are set`)
  }
}

if (fileExists('frontend/.next/dev/lock')) {
  warn(
    'Detected frontend/.next/dev/lock. If dev fails, stop old dev processes and remove this lock file.',
  )
}

if (process.exitCode && process.exitCode !== 0) {
  console.error('\n[preflight] Failed. Fix the errors above and run `pnpm preflight` again.')
} else {
  console.log('\n[preflight] All checks passed.')
}
