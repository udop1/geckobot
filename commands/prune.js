module.exports = {
    name: 'prune',
    description: 'Use the prune command to remove 1 to 99 messages.',
    aliases: ['purge', 'remove'],
    guildOnly: true,
    args: true,
    usage: '<number-of-messages>',
    execute(message, args) {
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
            const amount = parseInt(args[0]) + 1;

            if (isNaN(amount)) {
                return message.reply('That doesn\'t seem to be a valid number.');
            } else if (amount <= 1 || amount > 100) {
                return message.reply('You need to input a number between 1 and 99.');
            }

            message.channel.bulkDelete(amount, true).catch(err => {
                console.error(err);
                message.channel.send('There was an error trying to prune messages in this channel!');
            });
        } else {
            message.reply('You don\'t have the required permissions to remove messages.');
        }
    },
};