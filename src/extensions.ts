import { MessageBot } from '@bhmb/bot'
import * as fs from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { spawn } from 'child_process'
const clone = (repo: string, path: string) => promisify(spawn)('git', [
    'clone',
    repo,
    path
], undefined)

interface ExtensionInfo {
    user: string
    id: string
    package: string
    title: string
    description: string
    env: string
}

const log = (...messages: any[]) => console.log('[Extensions]', ...messages)

const extensionDir = join(__dirname, '..', 'extensions')
const defaultRepo = `https://raw.githubusercontent.com/Blockheads-Messagebot/Extensions/master/extensions.json`

const flatten = <T>(arr: T[][]): T[] => arr.reduce((carry, item) => carry.concat(item), [])

export interface ExtensionsExports {
    env: 'cloud' | 'mac'
    add(id: string): void
    remove(id: string): void
}

MessageBot.registerExtension('extensions', ex => {
    const fetch = ex.bot.fetch
    const extensionMap = new Map<string, ExtensionInfo>()
    let shouldLoad = new Set<string>()

    let extensionExports: ExtensionsExports = {
        env: 'cloud',
        add(id: string) {
            if (extensionMap.has(id)) {
                ex.bot.addExtension(id)
                ex.storage.with<string[]>('autoload', [], ids => {
                    if (!ids.includes(id)) ids.push(id)
                })
            } else {
                log(`${id} is not known`)
            }
        },
        remove(id: string) {
            try {
                ex.bot.removeExtension(id, true)
                ex.storage.with<string[]>('autoload', [], ids => {
                    if (!ids.includes(id)) ids.push(id)
                })
            } catch (error) {
                log('Error removing extension', error)
            }
        }
    }
    ex.exports = extensionExports

    function supported(info: ExtensionInfo): boolean {
        let env = info.env.toLocaleLowerCase()
        let supportedType = env.includes(ex.exports.env) || env.includes('all')
        let supportedEnv = env.includes('cli') || env.includes('all')
        return [
            supportedType,
            supportedEnv
        ].every(Boolean)
    }

    function load(id: string) {
        let info = extensionMap.get(id) as ExtensionInfo
        shouldLoad.add(id)
        if (/\.(m?js|es)/.test(info.package)) {
            // Single script file, download and require
            let split = id.split('/')
            split[split.length - 1] += '.js'
            const file = join(extensionDir, ...split)
            // Add a user directory if required
            if (split.length != 1 && !fs.existsSync(join(extensionDir, split[0]))) {
                fs.mkdirSync(join(extensionDir, split[0]))
            }

            fetch(info.package)
                .then(r => r.text())
                .then(s => fs.writeFileSync(file, s,))
                .then(() => require(file))
        } else if (/https?:\/\//.test(info.package)) {
            // Git repo, clone into extension dir and execute
            const dir = extensionDir + `/${id}`
            clone(info.package, dir)
                .then(() => require(dir))
        } else {
            // Npm package, install & execute
            promisify(spawn)('npm', ['install', info.package], undefined)
                .then(() => require(info.package))
        }
    }

    ex.remove = () => {
        throw new Error('This extension cannot be removed.')
    }

    function addExtension(id: string) {
        try {
            ex.bot.addExtension(id)
            ex.storage.with<string[]>('autoload', [], ids => {
                if (!ids.includes(id)) ids.push(id)
            })
            log(`${id} loaded`)
        } catch (error) {
            log(`Error adding ${id}:`, error)
            try {
                ex.bot.removeExtension(id, false)
            } catch { }
        }
    }

    MessageBot.extensionRegistered.sub(id => {
        // If in developer mode, autoload unconditionally
        if (ex.storage.get('devMode', false)) {
            if (ex.bot.getExports(id)) ex.bot.removeExtension(id, false)
            addExtension(id)
        } else if (shouldLoad.has(id)) {
            shouldLoad.delete(id)
            addExtension(id)
        }
    })

    let repos = ex.storage.get('repos', defaultRepo).split(/\r?\n/).reverse()
    let repoRequests = repos.map(repo => fetch(repo).then(r => r.json()))

    Promise.all(repoRequests)
        .then((packages: ExtensionInfo[][]) => {
            flatten(packages).filter(supported)
            .forEach(extension => {
                extensionMap.set(extension.id, extension)
            })
        })
        .then(() => {
            ex.storage.get<string[]>('autoload', [])
                .forEach(load)
        })
})
