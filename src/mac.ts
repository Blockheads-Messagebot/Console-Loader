require = require('@std/esm')(module, { cjs: true, esm: 'js' })

import { Api, getWorlds, watchChat } from 'blockheads-api/mac'
const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'))

import { MessageBot } from '@bhmb/bot'
import '@bhmb/messages'
import '@bhmb/server'
import { ExtensionsExports } from './extensions'
import './extensions'
import { Storage } from './storage'
import { info } from './config'

MessageBot.dependencies = { Api, getWorlds, fetch }

watchChat()
let bot = new MessageBot(new Storage(info.id), info)
bot.addExtension('messages')
bot.addExtension('extensions');
(bot.getExports('extensions') as ExtensionsExports).env = 'mac'
bot.addExtension('@bhmb/server')
console.log('Bot started.')
bot.world.onMessage.sub(({player, message}) => console.log(player.name, message))
