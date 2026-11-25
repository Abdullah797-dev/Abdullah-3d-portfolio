import { cpSync, mkdirSync } from 'node:fs'

const standaloneDir = '.next/standalone'

mkdirSync(`${standaloneDir}/.next`, { recursive: true })
cpSync('.next/static', `${standaloneDir}/.next/static`, { recursive: true })
cpSync('public', `${standaloneDir}/public`, { recursive: true })
