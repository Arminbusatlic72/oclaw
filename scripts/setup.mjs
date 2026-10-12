#!/usr/bin/env node

import {execSync} from 'node:child_process'

function run(command, label) {
  console.log(`\n[setup] ${label}`)
  execSync(command, {stdio: 'inherit'})
}

try {
  run('pnpm install', 'Installing dependencies')
  run('pnpm preflight', 'Running preflight checks')
  run('pnpm --filter frontend sanity:typegen', 'Generating Sanity schema and query types')
  run('pnpm type-check', 'Type-checking frontend and studio')

  console.log('\n[setup] Setup complete.')
  console.log('[setup] Start development with: pnpm dev')
} catch (error) {
  console.error('\n[setup] Setup failed. Fix errors above and run `pnpm bootstrap` again.')
  process.exit(1)
}
