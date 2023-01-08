const Discord = require('discord.js')
require("dotenv").config();


const rolesList = ["SARGENTO", "SUB TENIENTE", "SUB JEFE"]  // Agregar el rango PFA, para que lo encuentre al agregar a un nuevo PFA

const _client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
        Discord.GatewayIntentBits.GuildMembers,
    ],
  });

_client.once('ready', (bot) => {
    console.log(`Bot: ${bot.user.username}\nStatus: ${bot.presence.status}`)
})

_client.on('guildMemberUpdate', (oldMember, newMember) => {
    if(oldMember._roles.includes(process.env.PFA_ID.toString()) &&
    newMember._roles.includes(process.env.PFA_ID.toString())) // EL VIEJO Y EL NUEVO SON PFA. UPDATE
    {
        if (oldMember.roles.cache.size > newMember.roles.cache.size) { // Si hay menos rangos, se eliminó uno
            oldMember.roles.cache.forEach(role => {
                if (!newMember.roles.cache.has(role.id) && rolesList.includes(role.name))  {
                    // Se elimina el campo Nombre y Rango del sheets para que queden vacios y se escriban en la proxima secuencia (buscando por user Discord ID)
                    console.log("Nickname: " + newMember.nickname.split('-')[0])
                    console.log("Discord ID: " + newMember.id)
                    console.log("Rol removido: " + role.name)

                }
            });
        }  
        else if (oldMember.roles.cache.size < newMember.roles.cache.size) {  // Si hay menos rangos, se agregó uno
            newMember.roles.cache.forEach(role => {
                if (!oldMember.roles.cache.has(role.id) && rolesList.includes(role.name)) { // Si el antiguo no tiene el nuevo rol y si éste pertenece a la lista de los rangos
                    // Se escribe el campo Nombre y Rango del sheets para que ambos queden actualizados (buscando por user Discord ID)
                    console.log("Nickname: " + newMember.nickname.split('-')[0])
                    console.log("Discord ID: " + newMember.id)
                    console.log("Rol añadido: " + role.name)
                }
            });
        }
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
        // Se agrega nueva fila con el nuevo rango, nombre y discord ID
        console.log("Nickname: " + newMember.nickname.split('-')[0])
        console.log("Discord ID: " + newMember.id)
        // Ver de buscar el rango 'PFA' dentro del array de rangos
        console.log("add");
    }
});

_client.login(process.env.TOKEN_ID);