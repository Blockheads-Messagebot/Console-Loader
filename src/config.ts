import { readFileSync } from 'fs'
import { join } from 'path'
import * as assert from 'assert'

let parsed = JSON.parse(readFileSync(join(__dirname, '..', 'config', 'config.json'), 'utf8'))

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
            assert.equal(typeof root[key], format[key], `${key} is incorrectly set.`)
        } else {
            checkTypes(root[key], format[key])
        }
    }
}

checkTypes(parsed, format)

export const user: string = parsed.user
export const pass: string = parsed.pass
export const info: {name: string, id: string} = parsed.info
