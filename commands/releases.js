const {EmbedBuilder} = require('discord.js');

module.exports = {
    name: 'releases',
    description: 'See all movie/TV release dates.',
    async execute(interaction) {
        const {mysql} = require('../index');
        
        try {
            var getAllReleases = function() {
                let promise = new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        mysql.query("SELECT release_name, release_date, release_date_sort FROM tbl_Releases ORDER BY release_date_sort", function(error, result, field) {
                            if (error) throw error;
                            resolve(result);
                        });
                    }, 1000);
                });
                return promise;
            }
            var findReleases = await getAllReleases();

            const nthAmount = 10; //How many reminders per page (max per embed: 25)
            var releaseArrayName = findReleases.map(t => t.release_name);
            var releaseArrayDate = findReleases.map(t => t.release_date);

            var splitArrayName = new Array(Math.ceil(releaseArrayName.length / nthAmount)).fill().map(_ => releaseArrayName.splice(0, nthAmount));
            var splitArrayDate = new Array(Math.ceil(releaseArrayDate.length / nthAmount)).fill().map(_ => releaseArrayDate.splice(0, nthAmount));

            var embeddedReminder = [];
            var firstEmbed = true;
            if (splitArrayName.length > 0) {
                for (var i = 0; i < splitArrayName.length; i++) {
                    embeddedReminder[i] = new EmbedBuilder();
                    embeddedReminder[i].setColor('#0099ff');
                    embeddedReminder[i].setTitle('Upcoming Releases');

                    for (var j = 0; j < splitArrayName[i].length; j++) {
                        embeddedReminder[i].addFields({name: `${splitArrayName[i][j]}`, value: `${splitArrayDate[i][j]}`, inline: false});
                    }
                    if (firstEmbed == true) {
                        await interaction.reply({embeds: [embeddedReminder[i]]});
                        firstEmbed = false;
                    } else {
                        await interaction.followUp({embeds: [embeddedReminder[i]]});
                    }
                }
            } else {
                await interaction.reply({content: `There are no releases coming soon.`, ephemeral: true});
            }
        }
        catch (error) {
            return console.log(error);
        }
    },
};