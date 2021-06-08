module.exports = {
    name: 'ping',
    description: 'Ping!',
    guildOnly: true,
    cooldown: 3,
    execute(message, args) {
        message.channel.send('Pong.');
    },
};