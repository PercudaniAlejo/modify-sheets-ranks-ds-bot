const Discord = require('discord.js');
const express = require('express');
require('./spreadsheet.js');
const { _client } = require('./discord.js')
const app = express();
require("dotenv").config();

_client.once('ready', async (bot) => {
    console.log(`Bot: ${bot.user.username}\nStatus: ${bot.presence.status}`)
})


module.exports = app;