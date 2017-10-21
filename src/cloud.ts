require = require('@std/esm')(module, { cjs: true, esm: 'js' })

import { login, Api, getWorlds, setFetch } from 'blockheads-api/cloud'
const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))
setFetch(fetch)

import { MessageBot } from '@bhmb/bot'
import '@bhmb/messages'
import { ExtensionsExports } from './extensions'
import './extensions'
import { Storage } from './storage'
import { user, pass, info } from './config'

MessageBot.dependencies = { Api, getWorlds, fetch }

async function main() {
    try {
        console.log(`Logging in as ${user}...`)
        await login(user, pass)
        console.log('Logged in.')
    } catch {
        console.log('Login failed, bad username / password?')
        return
    }

    let bot = new MessageBot(new Storage(), info)
    bot.addExtension('messages')
    bot.addExtension('extensions');
    (bot.getExports('extensions') as ExtensionsExports).env = 'cloud'
    console.log('Bot started.')
}

main()
