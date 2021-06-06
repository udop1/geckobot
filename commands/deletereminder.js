module.exports = {
    name: 'deletereminder',
    description: 'Delete a created reminder.',
    guildOnly: true,
    args: true,
    usage: '<reminder-id>',
    async execute(message, args) {
        const {Reminders} = require('../index');
        const messageOwner = message.author.id;
        
        const rowCount = await Reminders.destroy({where: {reminder_id: args[0], username: messageOwner}});

        if (!rowCount) {
            return message.reply('You don\'t have a reminder with that ID.');
        }
        return message.reply('Reminder '+args[0]+' has been deleted!');
    },
};