const {Client, MessageEmbed} = require('discord.js');

module.exports = {
    name: 'viewreminders',
    description: 'View all your created reminders.',
    async execute(interaction) {
        const {mysql} = require('../index');
        const messageOwner = interaction.user.id;

        try {
            var findReminders;

            var getAllReminders = function() {
                let promise = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        mysql.query("SELECT reminder_id, reminder, start_time, end_duration, message_url, is_recurring FROM tbl_Reminders WHERE username = " + mysql.escape(messageOwner) + " ORDER BY end_duration", function(error, result, field) {
                            if (error) throw error;
                            resolve(result);
                        });
                    }, 1000);
                });
                return promise;
            }
            findReminders = await getAllReminders();

            const nthAmount = 9; //How many reminders per page (max per embed: 25)
            var reminderArrayID = findReminders.map(t => t.reminder_id);
            var reminderArrayReminder = findReminders.map(t => t.reminder);
            var reminderArrayStart = findReminders.map(t => t.start_time);
            var reminderArrayEnd = findReminders.map(t => t.end_duration);
            var reminderArrayURL = findReminders.map(t => t.message_url);
            var reminderArrayRecurring = findReminders.map(t => t.is_recurring);
            
            var splitArrayID = new Array(Math.ceil(reminderArrayID.length / nthAmount)).fill().map(_ => reminderArrayID.splice(0, nthAmount));
            var splitArrayReminder = new Array(Math.ceil(reminderArrayReminder.length / nthAmount)).fill().map(_ => reminderArrayReminder.splice(0, nthAmount));
            var splitArrayStart = new Array(Math.ceil(reminderArrayStart.length / nthAmount)).fill().map(_ => reminderArrayStart.splice(0, nthAmount));
            var splitArrayEnd = new Array(Math.ceil(reminderArrayEnd.length / nthAmount)).fill().map(_ => reminderArrayEnd.splice(0, nthAmount));
            var splitArrayURL = new Array(Math.ceil(reminderArrayURL.length / nthAmount)).fill().map(_ => reminderArrayURL.splice(0, nthAmount));
            var splitArrayRecurring = new Array(Math.ceil(reminderArrayRecurring.length / nthAmount)).fill().map(_ => reminderArrayRecurring.splice(0, nthAmount));

            console.log(splitArrayID);
            var reminderUser = await interaction.client.users.cache.get(messageOwner);

            var embeddedReminder = [];
            var firstEmbed = true;
            if (splitArrayID.length > 0) {
                for (i = 0; i < splitArrayID.length; i++) {
                    embeddedReminder[i] = new MessageEmbed()
                    embeddedReminder[i].setColor('#0099ff');
                    embeddedReminder[i].setTitle('Your Reminders:');
                    embeddedReminder[i].setAuthor(`${reminderUser.tag}`, reminderUser.displayAvatarURL({dynamic: true}))
                    embeddedReminder[i].setFooter(`Page ${i+1}`);
                    embeddedReminder[i].setTimestamp();

                    for (j = 0; j < splitArrayID[i].length; j++) {
                        var startDateObject = new Date(splitArrayStart[i][j] * 1000);
                        var endDateObject = new Date(splitArrayEnd[i][j] * 1000);
                        var startYear = startDateObject.getFullYear();
                        var endYear = endDateObject.getFullYear();
                        var startMonth = ('0' + (startDateObject.getMonth() + 1)).substr(-2); //+1 to month to make it correct
                        var endMonth = ('0' + (endDateObject.getMonth() + 1)).substr(-2); //+1 to month to make it correct
                        var startDate = ('0' + startDateObject.getDate()).substr(-2);
                        var endDate = ('0' + endDateObject.getDate()).substr(-2);
                        var startHour = ('0' + startDateObject.getHours()).substr(-2);
                        var endHour = ('0' + endDateObject.getHours()).substr(-2);
                        var startMin = ('0' + startDateObject.getMinutes()).substr(-2);
                        var endMin = ('0' + endDateObject.getMinutes()).substr(-2);
                        var startSec = ('0' + startDateObject.getSeconds()).substr(-2);
                        var endSec = ('0' + endDateObject.getSeconds()).substr(-2);
                        var startTime = startDate + '/' + startMonth + '/' + startYear + ' at ' + startHour + ':' + startMin + ':' + startSec;
                        var endTime = endDate + '/' + endMonth + '/' + endYear + ' at ' + endHour + ':' + endMin + ':' + endSec;

                        embeddedReminder[i].addFields({name: `ID: ${splitArrayID[i][j]}`, value: `Reminder: ${splitArrayReminder[i][j]}\nStart: ${startTime}\nEnd: ${endTime}\nRecurring: ${splitArrayRecurring[i][j]}\n**[Original Message](${splitArrayURL[i][j]})**`, inline: true});
                    }
                    if (firstEmbed == true) {
                        await interaction.reply({embeds: [embeddedReminder[i]]});
                        firstEmbed = false;
                    } else {
                        await interaction.followUp({embeds: [embeddedReminder[i]]});
                    }
                    
                }
            } else {
                await interaction.reply({ content: `You have no reminders! Set one using the \`addreminder\` command.`, ephemeral: true });
            }
        }
        catch (error) {
            return console.log(error);
        }
    },
};