module.exports = {
    name: 'deletereminder',
    description: 'Delete a created reminder.',
    options: [
        {
            name: "id",
            description: "Reminder's ID",
            type: 4, //Integer
            required: true,
        },
    ],
    async execute(interaction) {
        const {mysql} = require('../index');
        const messageOwner = interaction.user.id;
        const reminderID = interaction.options.getInteger('id');
        
        mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(reminderID) + " AND username = " + mysql.escape(messageOwner), function (error, result) {
            if (error) throw error;
            if (result.affectedRows == 0) {
                return interaction.reply({ content: 'You don\'t have a reminder with that ID.', ephemeral: true });
            } else {
                console.log("Reminder ID Deleted: " + reminderID);
                return interaction.reply('Reminder '+reminderID+' has been deleted!');
            }
        });
    },
};