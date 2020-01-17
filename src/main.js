const Discord = require('discord.js')
const fs = require('fs')
const sendEmbed = require('./sendEmber.js')
const { prefix, token, firstField } = require('./config.json')
const client = new Discord.Client()
const guildID = '659185483313709066'
const channelLogID = '667806299676999681'
const timeout = (callback, tempo) => setTimeout(callback, tempo);
let tempo = undefined
let registro = new Array();

client.on('ready', () => {
    console.log("Moriart on, tente não abusar, notificações são irritantes para 75% das pessoas.");
});
client.on('message', async (message) => {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const context = message.content.split(' ')
    const cmd = context[0]
    const args = context.slice(1)
    if (!args[0]) {
        return;
    }
    const channel = message.channel
    const sender = message.author
    const avatar = (sender.avatarURL) ? sender.avatarURL : undefined
    let divulgacao = undefined
    for (const texto of args) { // isso aqui pega a mensagem que o cara digitou após !divulgar fica armazenado na variavel let **divulgacao**
        divulgacao = divulgacao + " " + texto
    }
    if (cmd === `${prefix}registrar`) {
        message.delete()
        if(!(message.guild.members.get(sender.id).roles.has('659505627084619786') || message.guild.members.get(sender.id).roles.has('659546264479858690'))){
            channel.send("você não tem permissão para solicitar registros.").then(msg => msg.delete(10000))
            return 
        }
        if (channel.type === 'dm') return;
        const user = message.mentions.users.first()
        if (registro.includes(user)) {
            channel.send("**" + user.username + "** já foi enviado um formulário de registro para esse usuário.").then(msg => msg.delete(10000))
            return;
        }
        if(!user){
            channel.send("mano, esse usuário não existe.").then(msg => msg.delete(10000))
            return;
        }
        const dm = user.createDM()
        channel.send('um formulario de registro foi enviado para ' + user.username).then(msg => msg.delete(10000))
        dm.then(pv => {
            let field = fs.readFileSync(`./src/cargos/${firstField}`, 'utf-8')
            field = JSON.parse(field)
            sendEmbed(user, message, field).then(msg => {
                msg.react('🚹').then(() => msg.react('🚺').then(() => msg.react('🚫')))
                registro.push(user)
                tempo = timeout(() => {
                    registro.splice(user)
                    msg.delete()
                    client.channels.get(channelLogID).sendMessage("**" + user.username + "** não concluiu o registro a tempo.")
                }, 6000)
            }).catch(erro => message
                .channel.send(user + " ative suas mensagens diretas para se registrar."))
        })
        // })
    }
});

// fazer as parte de reação e 
client.on('messageReactionAdd', (messageReaction, user) => {
    const privateMessage = messageReaction.message
    const privateEmoji = messageReaction.emoji.name
    const privateChannel = privateMessage.channel
    const usuario = client.guilds.get(guildID).members.get(user.id)
    // let currentFile = firstField

    if (privateChannel.type === 'dm') {
        registro.find(user => {
            messageReaction.users.filter(unknowUser => unknowUser === user).forEach(user => {
                //envia as embds
                fs.readdir('./src/cargos/', 'utf-8', (err, res) => {
                    if (!err) {
                        res.forEach(file => {
                            const fileName = file
                            fs.readFile(`./src/cargos/${file}`, 'utf-8', (err, data) => {
                                if (!err) {
                                    // if (currentFile === firstField) {
                                    const files = JSON.parse(data)
                                    files.map(file => {
                                        const roleName = file.name
                                        const emoji = file.emoji
                                        const proximo = file.proximo
                                        const roleId = file.id

                                        if (emoji && roleId) {
                                            if (emoji === privateEmoji) {
                                                privateMessage.delete()
                                                usuario.addRole(roleId)
                                                const log = client.channels.get(channelLogID)
                                                log.send("**[Moriart]** » **" + user.username + "** escolheu a tag " + roleName + "!")
                                                if (tempo) {
                                                    clearTimeout(tempo)
                                                }
                                                if (!proximo) {
                                                    log.send(`**[Moriart]** » ${user.username} concluiu seu registro.`)
                                                }
                                                fs.readFile(`./src/cargos/${file.proximo}`, 'utf-8', async (err, res) => {
                                                    if (!err) {
                                                        const fields = await JSON.parse(res)
                                                        const emojis = new Array()
                                                        fields.map(e => emojis.push(e.emoji))
                                                        sendEmbed(user, privateMessage, fields).then(async msg => {
                                                            for (let i = 0; i <= emojis.length; i++) {
                                                                await msg.react(emojis[i])
                                                            }
                                                            tempo = timeout(() => {
                                                                registro.splice(user)
                                                                msg.delete()
                                                                log.sendMessage(`**[Moriart]** » ${user.username} não concluiu seu registro.`)
                                                            }, 60000)
                                                        }).catch(erro => console.log('[warning] fast emoji reaction from user !' + user.username))

                                                    }
                                                })
                                                // }

                                            }

                                        }
                                    })
                                    // }

                                } else {
                                    console.log('[ERRO] diretório do primeiro arquivo não foi encontrado')
                                }
                            })
                        })
                    }
                })
            })
        })
    }
});

client.login(token);