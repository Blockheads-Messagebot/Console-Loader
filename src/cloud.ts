require = require('@std/esm')(module, { cjs: true, esm: 'js' })

import { login, Api, getWorlds, setFetch } from 'blockheads-api/cloud'
setFetch(require('fetch-cookie/node-fetch')(require('node-fetch')))

import { MessageBot } from '@bhmb/bot'
import '@bhmb/messages'
import { Storage } from './storage'
import { user, pass, info } from './config'

MessageBot.dependencies = { Api, getWorlds }

async function main() {
    try {
        console.log(`Logging in as ${user}...`)
        await login(user, pass)
        console.log('Logged in.')
    } catch {
        console.log('Login failed, bad username / password?')
        return
    }

    new MessageBot(new Storage(), info)
    console.log('Bot started.')
}

main()
