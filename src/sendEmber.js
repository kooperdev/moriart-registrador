const discord = require('discord.js')
module.exports = (user, message, fields) => {
    const embed = {
        color: 0x0099ff,
        title: '**REGISTRADOR**',
        url: undefined,
        author: {
            name: undefined,
            icon_url: undefined,
            url: undefined,
        },
        description: 'responda o formulário de acordo com seu perfil.',
        thumbnail: {
            url: undefined,
        },
        fields,
        image: {
            url: undefined,
        },
        timestamp: new Date(),
        footer: {
            text: 'Criado por KØØPЄR#0874',
            icon_url: 'https://cdn.discordapp.com/avatars/384125313761673217/d3f232aa7f7d886cd593b060562ff17a.webp',
        },
    };
    return user.send(new discord.RichEmbed(embed))
    
}