module.exports = {
    name: 'server',
    description: 'Allows you to get info about the server.',
    guildOnly: true,
    execute(message, args) {
        message.channel.send(`This server's name is: ${message.guild.name}\nTotal Members: ${message.guild.memberCount}\nCreated at: ${message.guild.createdAt}`);
    },
};