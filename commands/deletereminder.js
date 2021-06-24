module.exports = {
    name: 'deletereminder',
    description: 'Delete a created reminder.',
    guildOnly: true,
    args: true,
    usage: '<reminder-id>',
    async execute(message, args) {
        const {Reminders, mysql} = require('../index');
        const messageOwner = message.author.id;
        
        //const rowCount = await Reminders.destroy({where: {reminder_id: args[0], username: messageOwner}});
        mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(args[0]), function (error, result) {
            //if (error) throw error;
            if (error) {
                console.log(error);
                return message.reply('You don\'t have a reminder with that ID.');
            }
            console.log("Reminder ID Deleted: " + args[0]);
        });

        /*if (!rowCount) {
            return message.reply('You don\'t have a reminder with that ID.');
        }*/
        return message.reply('Reminder '+args[0]+' has been deleted!');
    },
};
