require = require('@std/esm')(module)

import { login, Api, getWorlds, setFetch } from 'blockheads-api/cloud'
setFetch(require('fetch-cookie/node-fetch')(require('node-fetch')))

import { MessageBot } from '@bhmb/bot'
import { Storage } from './storage'

import { user, pass, info } from '../config/login'

MessageBot.dependencies = { Api, getWorlds }

async function main() {
    try {
        console.log(`Logging in as ${user}!`)
        await login(user, pass)
        console.log('Logged in!')
    } catch {
        console.log('Login failed, bad username / password?')
        return
    }

    let bot = new MessageBot(new Storage(), info)
    bot.send('Successfully started!')
    console.log('Done')
}

main()
