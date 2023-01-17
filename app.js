const Discord = require('discord.js');
const express = require('express');

const {modifyRow, addNewRow, deleteRowByDID, modifyNickname} = require('./spreadsheet.js');
const { _client } = require('./discord.js')
const app = express();
require("dotenv").config();

_client.once('ready', async (bot) => {
    console.log(`Bot: ${bot.user.username}\nStatus: ${bot.presence.status}`)
})

// Hacerlo un dic con el discord id de cada rango
const rolesList = ["PFA","Cadete", "Agente", "Cabo", "Cabo 1°", "Sargento", "Sargento 1°", "Sargento Mayor", "Sub Teniente", "Teniente", "Sub Inspector", "Inspector", "Sub Comisario", "Comisario", "Sub Jefe", "Jefe", "Director"]  // Agregar el rango PFA, para que lo encuentre al agregar a un nuevo PFA


_client.on('messageCreate', async message => {
    if(message.channel.id === process.env.CHANNEL_ID &&
        message.content.toLocaleLowerCase().includes('expulsado') ||
        message.content.toLocaleLowerCase().includes('retirado')) {
        // const userIdMentioned = message.mentions.users.first().id
        // message.channel.send('respuesta')
        // .then(message => console.log(`Sent message: ${message.content}`))
        // .catch(console.error);
    }
  })

_client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
    newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO Y EL NUEVO SON PFA. UPDATE
    {
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {  // Si hay menos rangos, se agregó uno
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id) && rolesList.includes(role.name)) { // Si el antiguo no tiene el nuevo rol y si éste pertenece a la lista de los rangos
                    // Se escribe el campo Nombre y Rango del sheets para que ambos queden actualizados (buscando por user Discord ID)
                    modifyRow(newMember, role.name)
                    const channel = _client.channels.cache.get(process.env.CHANNEL_ID)
                    channel.send("<@" + newMember.id + "> " + role.name) // Se manda al canal el cambio realizado
                    }
            }); 
        }
        else if(oldMember.nickname != newMember.nickname) // Cambio de nombre
            modifyNickname(newMember)
    }

    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        !newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO ES PFA PERO EL NUEVO NO. DELETE
    {
        // Se elimina directamente la fila del sheets buscando por user DiscordID
        newMember.roles.cache.forEach(role => {
            if (role.name != 'PFA' && rolesList.includes(role.name)) 
                deleteRowByDID(newMember, role.name, true)
        });
    }

    if(!oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO NO ES PFA PERO EL NUEVO SI. ADD
        {
            newMember.roles.cache.forEach(role => {
                if (role.id.toString() == process.env.PFA_ID && !oldMember.roles.cache.has(role.id) && rolesList.includes(role.name))
                    addNewRow(newMember, 'RANGOS')
        })
    }
});

module.exports = app;