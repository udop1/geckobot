module.exports = {
    name: 'avatar',
    description: 'Allows you to get a user\'s avatar.',
    aliases: ['pfp'],
    guildOnly: true,
    args: true,
    usage: '<mention-the-user> <mention-another-user>...',
    execute(message, args) {
        /*if (!message.mentions.users.size) {
            return message.channel.send(`Your Avatar: <${message.author.displayAvatarURL({format: "png", dynamic: true})}>`);
        }*/

        const avatarList = message.mentions.users.map(user => {
            return `${user.username}'s Avatar: <${user.displayAvatarURL({format: "png", dynamic: true})}>`;
        });

        //Send entire array of strings as message. By default, discord.js will `.join()` the array with `\n`
        message.channel.send(avatarList);
    },
};