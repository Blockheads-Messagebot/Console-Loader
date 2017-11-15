import { readFileSync } from 'fs'
import { join } from 'path'
import * as assert from 'assert'
import { exit } from 'process'

let parsed: any;
try {
    parsed = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'config.json'), 'utf8'))
} catch {
    console.log('Missing config file.')
    exit(1)
} finally {
    if (!parsed) {
        console.log('Failed to parse JSON.')
        exit(1)
    }
}

let format = {
    user: 'string',
    pass: 'string',
    info: {
        name: 'string',
        id: 'string'
    }
}

// Sometimes I just want to do what I want to do, let me do it Typescript.
// Helper function to check types
function checkTypes(root: any, format: any) {
    for (let key in format) {
        if (['string', 'number'].includes(format[key])) {
            assert.equal(typeof root[key], format[key], `${key} is incorrectly set. ${typeof root[key]}`)
        } else {
            checkTypes(root[key], format[key])
        }
    }
}

try {
    checkTypes(parsed, format)
} catch (error) {
    console.log(error.message)
    exit(1)
}

export const user: string = parsed.user
export const pass: string = parsed.pass
export const info: {name: string, id: string} = parsed.info
