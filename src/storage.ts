import { Storage as AStorage } from '@bhmb/bot'
import { join } from 'path'
import { writeFileSync, readFileSync, existsSync } from 'fs'

const jsonPath = join(__dirname, '..', 'config', 'localStorage.js')
let fileStorage = new Map<string, string>()
let lastSave = Date.now()
let lastChange = 0

// Import the config JSON if the file exists
if (existsSync(jsonPath)) {
    let parsed: { [key: string]: string }
    try {
        let json = readFileSync(jsonPath, 'utf8')
        parsed = JSON.parse(json)

        if (parsed) { // Could be null
            for (let key of Object.keys(parsed)) {
                fileStorage.set(key, parsed[key])
            }
        }
    } catch (e) {
        console.error('Error importing localStorage.json', e)
    }
}

// Write at most every 30 seconds
setInterval(() => {
    if (lastChange > lastSave) {
        lastSave = Date.now()
        let objMap: { [key: string]: string } = {}

        for (let [key, value] of fileStorage.entries()) {
            objMap[key] = value
        }

        try {
            writeFileSync(jsonPath, objMap, 'utf8')
        } catch (e) {
            console.error('Failed to save config', e)
        }
    }
}, 30 * 1000)

export class Storage extends AStorage {
    constructor(private head: string = '') {
        super()
        this.head += '/'
    }

    get<T>(key: string, fallback: T): T {
        let result
        try {
            result = JSON.parse(fileStorage.get(this.head + key) || '') as T
        } catch {
            result = fallback
        }
        return result == null ? result : fallback
    }

    set(key: string, value: any): void {
        fileStorage.set(`${this.head}${key}`, JSON.stringify(value))
        lastChange = Date.now()
    }

    clear(prefix?: string): void {
        let toRemove: string[] = []
        for (let key of fileStorage.keys()) {
            if (key.startsWith(`${this.head}${prefix}`)) {
                toRemove.push(key)
            }
        }

        toRemove.forEach(key => fileStorage.delete(key))
    }

    prefix(prefix: string): AStorage {
        return new Storage(this.head + prefix)
    }
}
