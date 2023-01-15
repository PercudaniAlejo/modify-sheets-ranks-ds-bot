const Discord = require('discord.js');
const express = require('express');
const {google} = require('googleapis');
const app = express();

require("dotenv").config();

const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })
const spreadsheetId = '1Oo7_5llkYMqwpJxKD6WvvNQVMhXAGMCA0DwXR0gDiOE';
const _clientGoogle = auth.getClient(); // Se instancia nuevo cliente para auth
const googleSheets = google.sheets({version: "v4", auth: _clientGoogle}) // Se instancia la API de Google Sheets 

const _client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
    ],
  });

app.get('/', async (req, res) => { 
    const getRows = await googleSheets.spreadsheets.values.get({
        auth, 
        spreadsheetId,
        range: 'RANGOS',
    })

    const metaData = await googleSheets.spreadsheets.get({
        auth, 
        spreadsheetId,
    }) 

    const result = await googleSheets.spreadsheets.values.batchGet({
        auth, 
        spreadsheetId,
        ranges: ['B2:D5']
      });
      backgroundColorStyle


    // res.send(result.)
});

_client.once('ready', async (bot) => {
    console.log(`Bot: ${bot.user.username}\nStatus: ${bot.presence.status}`)
})

    const rolesList = ["SARGENTO", "SUB TENIENTE", "SUB JEFE", "PFA"]  // Agregar el rango PFA, para que lo encuentre al agregar a un nuevo PFA
    
_client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
    newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO Y EL NUEVO SON PFA. UPDATE
    {
        const getRows = await googleSheets.spreadsheets.values.get({
            auth, 
            spreadsheetId,
            range: 'RANGOS',
        })

        let rowID = 0
        Object.entries(getRows.data.values).forEach(entry => {
            const [key, value] = entry;
            value.forEach(cell => {
                if(cell == newMember.id) 
                    rowID = parseInt(key) + 1
            })
        })

        if (oldMember.roles.cache.size < newMember.roles.cache.size) {  // Si hay menos rangos, se agregó uno
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id) && rolesList.includes(role.name)) { // Si el antiguo no tiene el nuevo rol y si éste pertenece a la lista de los rangos
                    // Se escribe el campo Nombre y Rango del sheets para que ambos queden actualizados (buscando por user Discord ID)
                    googleSheets.spreadsheets.values.update({
                        auth,
                        spreadsheetId,
                        range: 'RANGOS!B' + rowID + ':E' + rowID, // Rango de celdas a modificar en una fila
                        valueInputOption: 'USER_ENTERED',
                        resource: {
                            values: [[role.name,
                                    newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname,
                                    newMember.id,
                                    new Date().toLocaleString().split(',')[0] ]]
                        }
                    })
                    // console.log("Nickname: " + newMember.nickname.split('-')[0])
                    // console.log("Discord ID: " + newMember.id)
                    // console.log("Rol añadido: " + role.name)
                }
            });
        }
        else if(oldMember.nickname != newMember.nickname) // Cambio de nombre
        {
            googleSheets.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range: 'RANGOS!C' + rowID + ':C' + rowID,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[newMember.nickname.includes('-') ? newMember.nickname.split('-')[0] : newMember.nickname]] // Se le agrega con el nombre que esté... cuando se lo cambie será un update
                }
            })
        }
        console.log("update");
    }

    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        !newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO ES PFA PERO EL NUEVO NO. DELETE
    {
        // Se elimina directamente la fila del sheets buscando por user DiscordID
        const getRows = await googleSheets.spreadsheets.values.get({
            auth, 
            spreadsheetId,
            range: 'RANGOS',
        })

        Object.entries(getRows.data.values).forEach(entry => {
            const [key, value] = entry;
            value.forEach(cell => {
                if(cell == newMember.id) 
                {
                    googleSheets.spreadsheets.batchUpdate({
                        auth: auth,
                        spreadsheetId: spreadsheetId,
                        resource: {
                            "requests": 
                            [{
                                "deleteRange": 
                                {
                                "range": 
                                {
                                    "sheetId": 0, 
                                    "startRowIndex": parseInt(key), // A partir de la fila que va a borrar (no incluye)
                                    "endRowIndex": parseInt(key) + 1// Fila a borrar
                                },
                                "shiftDimension": "ROWS"
                                }
                            }]
                        }
                    })
                } 
            })
        })

        console.log("Discord ID: " + newMember.id)
        console.log("delete");
    }

    if(!oldMember._roles.includes(process.env.PFA_ID.toString()) &&
        newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO NO ES PFA PERO EL NUEVO SI. ADD
    {
        newMember.roles.cache.forEach(role => {
            if (role.id.toString() == process.env.PFA_ID && !oldMember.roles.cache.has(role.id) && rolesList.includes(role.name))
            {
                
                // range.setBackground("red");
                // Se agrega nueva fila con el nuevo rango, nombre y discord ID
                googleSheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: 'RANGOS',
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [
                            ['', newMember.nickname, newMember.id, new Date().toLocaleString().split(',')[0]] // Se le agrega con el nombre que esté... cuando se lo cambie será un update
                        ]
                    }
                })
            }
        })

        console.log("\nNickname: " + newMember.nickname.split('-')[0])
        console.log("Discord ID: " + newMember.id)
        // Ver de buscar el rango 'PFA' dentro del array de rangos
        console.log("add");
    }
});

_client.login(process.env.TOKEN_ID);
app.listen(1337, (req, res) => console.log("Corriendo"))