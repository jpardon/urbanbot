const Discord = require('discord.js'),
    client = new Discord.Client(),
    config = require("./config"),
    urban = require('./modules/urban');

const prefix = config.prefix;

client.on('ready', () => {
    console.log(`Client running! ${client.user.username}#${client.user.discriminator} | Guilds: ${client.guilds.size.toLocaleString()} | Users: ${client.users.size.toLocaleString()}`);

    client.user.setPresence({
        game: {
            name: "!define",
            type: 0
        }
    });

    setInterval(() => {
        urban.postServerCount(client);
    }, 1000 * 60 * 30);
});

client.on('message', async (message) => {
    if (message.author.bot) return;

    let embed = new Discord.RichEmbed();

    if (message.author.id == "193767604932837378" && message.content == config.statsprefix) {
        const stats = await urban.getBotStats(client);
        embed.addField('Guilds', stats.guilds.toLocaleString(), true)
            .addField('Users', stats.members.toLocaleString(), true)
            .setColor(0x0795e5);
        return message.channel.send(embed)
            .catch(err => {
                message.channel.send('I need permission to post embeds!');
            });
    }

    let args = message.content.split(" ");

    if (message.content == `!random`) {
        urban.log("random", message.author.username, message.guild.name);
        urban.getRandom()
            .then(r => {
                const date = new Date(Date.parse(r.date));

                embed.setFooter(`Definition by ${r.author} on ${date.toLocaleDateString()}`)
                    .setAuthor(`Random Urban definition: ${r.term}`, client.user.avatarURL)
                    .setDescription(r.definition)
                    .setColor(0x0795e5)
                    .addField("Example", `*${r.example}*\n\n[Direct link to definition](${r.link}) | [Upvote me](https://discordbots.org/bot/439102015969296387)`);

                message.channel.send(embed)
                    .catch(err => {
                        message.channel.send('I need permission to post embeds!');
                    });
            })
            .catch(err => {
                embed.setDescription(err)
                    .setColor(0xff0000);

                message.channel.send(embed)
                    .catch(err => {
                        message.channel.send('I need permission to post embeds!');
                    });
            });
    }
    if (!message.content.startsWith(prefix)) return;
    if (message.content == prefix) return message.reply(config.help);

    args.shift();
    const term = args.join(" ");

    urban.log(`define ${term}`, message.author.username, message.guild.name);
    urban.findDefinition(term)
        .then(r => {
            const date = new Date(Date.parse(r.date));

            embed.setFooter(`Definition by ${r.author} on ${date.toLocaleDateString()}`)
                .setAuthor(`Urban definition for '${term}'`, client.user.avatarURL)
                .setDescription(r.definition)
                .setColor(0x0795e5)
                .addField("Example", `*${r.example}*\n\n[Direct link to definition](${r.link}) | [Upvote me](https://discordbots.org/bot/439102015969296387)`);

            message.channel.send(embed)
                .catch(err => {
                    message.channel.send('I need permission to post embeds!');
                });
        })
        .catch(err => {
            embed.setDescription(err)
                .setColor(0xff0000);

            message.channel.send(embed)
                .catch(err => {
                    message.channel.send('I need permission to post embeds!');
                });
        });
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason, 'stack', reason.stack);
});

client.login(config.token);