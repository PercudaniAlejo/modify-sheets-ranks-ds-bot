const Discord = require('discord.js');
const express = require('express');

const {addNewRow} = require('./spreadsheet.js');
const { _client } = require('./discord.js')
const app = express();
require("dotenv").config();

_client.once('ready', async (bot) => {
    console.log(`Bot: ${bot.user.username}\nStatus: ${bot.presence.status}`)
})

const rolesList = ["SARGENTO", "SUB TENIENTE", "SUB JEFE", "PFA"]  // Agregar el rango PFA, para que lo encuentre al agregar a un nuevo PFA

_client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
    newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO Y EL NUEVO SON PFA. UPDATE
    {
        if (oldMember.roles.cache.size < newMember.roles.cache.size) {  // Si hay menos rangos, se agregó uno
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id) && rolesList.includes(role.name)) { // Si el antiguo no tiene el nuevo rol y si éste pertenece a la lista de los rangos
                    // Se escribe el campo Nombre y Rango del sheets para que ambos queden actualizados (buscando por user Discord ID)
                    console.log("Nickname: " + newMember.nickname.split('-')[0])
                    console.log("Discord ID: " + newMember.id)
                    console.log("Rol añadido: " + role.name)
                }
            });
        }
        else if(oldMember.nickname != newMember.nickname) // Cambio de nombre
            console.log("Nickname: " + newMember.nickname)
        console.log("update");
    }

    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        !newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO ES PFA PERO EL NUEVO NO. DELETE
    {
        // Se elimina directamente la fila del sheets buscando por user DiscordID
        console.log("Discord ID: " + newMember.id)
        console.log("delete");
    }

    if(!oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO NO ES PFA PERO EL NUEVO SI. ADD
    {
        newMember.roles.cache.forEach(role => {
            if (role.id.toString() == process.env.PFA_ID && !oldMember.roles.cache.has(role.id) && rolesList.includes(role.name))
            {
                addNewRow(newMember)
                console.log("\nNickname: " + newMember.nickname.split('-')[0])
                console.log("Discord ID: " + newMember.id)
                // Ver de buscar el rango 'PFA' dentro del array de rangos
                console.log("add");
            }
        })
    }
});

module.exports = app;