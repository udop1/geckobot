module.exports = {
    name: 'user-info',
    description: 'Allows you to get info about a user.',
    guildOnly: true,
    execute(message, args) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
    },
};