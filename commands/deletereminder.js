module.exports = {
    name: 'deletereminder',
    description: 'Delete a created reminder.',
    guildOnly: true,
    args: true,
    usage: '<reminder-id>',
    async execute(message, args) {
        const {mysql} = require('../index');
        const messageOwner = message.author.id;
        
        //const rowCount = await Reminders.destroy({where: {reminder_id: args[0], username: messageOwner}});
        mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(args[0]) + " AND username = " + mysql.escape(messageOwner), function (error, result) {
            if (error) throw error;
            if (result.affectedRows == 0) {
                return message.reply('You don\'t have a reminder with that ID.');
            } else {
                //console.log(result);
                console.log("Reminder ID Deleted: " + args[0]);
                return message.reply('Reminder '+args[0]+' has been deleted!');
            }
        });
    },
};
