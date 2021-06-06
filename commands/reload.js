module.exports = {
    name: 'reload',
    description: 'Reloads a command',
    guildOnly: true,
    args: true,
    usage: '<command>',
    execute(message, args) {
        //const member = message.mentions.members.first();
        if (message.member.roles.cache.has('673971227584364613')) { //Top Gecks
            const commandName = args[0].toLowerCase();
            const command = message.client.commands.get(commandName)
                || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
                
            if (!command) {
                if (message.author.id === '149614086789922816') { //Udop1
                    if (args[0].toLowerCase() === 'bot') {
                        process.exit();
                    } else {
                        return message.channel.send(`There\'s no command with the name or alias \`${commandName}\`, ${message.author}!`);
                    }
                } else {
                    return message.channel.send(`There\'s no command with the name or alias \`${commandName}\`, ${message.author}!`);
                }
            }

            delete require.cache[require.resolve(`./${command.name}.js`)];

            try {
                const newCommand = require(`./${command.name}.js`);
                message.client.commands.set(newCommand.name, newCommand);
                message.channel.send(`Command \`${command.name}\` was reloaded!`);
            } catch (error) {
                console.log(error);
                message.channel.send(`There was an error whilst reloading the command \`${command.name}\`:\n\`${error.message}\``);
            }
        } else {
            message.reply('You don\'t have the required permissions to reload commands.');
        }
    },
};