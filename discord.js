const Discord = require('discord.js');

const _client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
    ],
  });

_client.login(process.env.TOKEN_ID);

module.exports = { _client }
