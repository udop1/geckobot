//Require Node's native file system module
const fs = require('fs');

//Require the discord.js module
const { Client, Collection, Intents, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

//Require the MySQL module
const MySQL = require('mysql');

//Require the config.json file
const {token, APIKEY, APISECRET, HOST, USER, PASSWORD, DATABASE} = require('./config.json');

//Require Binance API
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: `${APIKEY}`,
    APISECRET: `${APISECRET}`,
    useServerTime: true,
});

//Create a new Discord client, and commands Collection Collection
const client = new Client({intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILDS]});
client.commands = new Collection();

//Returns an array of all file names in that directory with the JavaScript file extension
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    //Create a new item in the Collection with the key set as the command's name and the value as the exported module
    client.commands.set(command.name, command);
}

const commands = client.commands.map(({ execute, ...data }) => data);
const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands('666645858288140299', '441302620125003788'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

//Database connection info
const mysql = MySQL.createConnection({
    host: `${HOST}`,
    user: `${USER}`,
    password: `${PASSWORD}`,
    database: `${DATABASE}`
});

module.exports.mysql = mysql;
module.exports.binance = binance;

//Once client is ready, trigger code once after logging in
client.once('ready', () => {
    console.log('RemindMe! Bot is online.');
});

client.on('ready', () => { //Once client is ready
    setInterval(async function() { //Check reminders
        var currentTime = new Date().getTime() / 1000;
        var finishedReminders;

        var getFinishedReminders = function() {
            let promise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    mysql.query("SELECT reminder_id, username, reminder, start_time, recurrence_time, end_duration, channel_in, message_url, is_recurring FROM tbl_Reminders WHERE " + mysql.escape(currentTime) + " >= end_duration ORDER BY end_duration LIMIT 1", function (error, result, fields) {
                        if (error) throw error;
                        resolve(result[0]);
                    });
                }, 1000);
            });
            return promise;
        };

        finishedReminders = await getFinishedReminders();
        
        try {
            var reminderUser = await client.users.fetch(finishedReminders.username);
            var isRecurring = finishedReminders.is_recurring;
            var unixTime = finishedReminders.start_time;
            var endTime = finishedReminders.end_duration;
            //var recurringTime = (endTime - unixTime) + endTime;
            var recurringTime = endTime + finishedReminders.recurrence_time;
            console.log(recurringTime);

            var dateObject = new Date(unixTime * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = dateObject.getFullYear();
            var month = months[dateObject.getMonth()];
            var date = dateObject.getDate();
            var hour = dateObject.getHours();
            var min = dateObject.getMinutes();
            var sec = dateObject.getSeconds();
            var time = date + '/' + month + '/' + year + '/' + hour + ':' + min + ':' + sec ;

            if (isRecurring == 'false') {
                var embedReminder = new MessageEmbed() //ADD SNOOZE BUTTON TO THIS
                .setColor('#0099ff')
                .setAuthor(`${reminderUser.tag}`, reminderUser.displayAvatarURL({dynamic: true}))
                .addFields(
                    {name: 'Your Reminder:', value: `${finishedReminders.reminder}\n`},
                    {name: '\u200b', value: `**[Original Message](${finishedReminders.message_url})**`}
                )
                .setFooter('Time Set')
                .setTimestamp(time);

                /*var buttonRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('snooze')
                            .setLabel('Snooze Reminder')
                            .setStyle('PRIMARY'),
                    );*/
    
                client.channels.cache.get(`${finishedReminders.channel_in}`).send({ content: '<@'+finishedReminders.username+'>,\n', embeds: [embedReminder]/*, components: [buttonRow]*/ });

                mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(finishedReminders.reminder_id), function (error, result) {
                    if (error) throw error;
                    console.log("Reminder ID Ended: " + finishedReminders.reminder_id);
                });
            } else if (isRecurring == 'true') {
                var embedReminder = new MessageEmbed()
                .setColor('#0099ff')
                .setAuthor(`${reminderUser.tag}`, reminderUser.displayAvatarURL({dynamic: true}))
                .addFields(
                    {name: 'Your Recurring Reminder:', value: `${finishedReminders.reminder}\n`},
                    {name: '\u200b', value: `**[Original Message](${finishedReminders.message_url})**`}
                )
                .setFooter('Time Set')
                .setTimestamp(time);
    
                client.channels.cache.get(`${finishedReminders.channel_in}`).send({ content: '<@'+finishedReminders.username+'>,\n', embeds: [embedReminder] });

                mysql.query("UPDATE tbl_Reminders SET start_time = " + mysql.escape(Math.trunc(new Date().getTime() / 1000)) + " , end_duration = " + mysql.escape(recurringTime) + " WHERE reminder_id = " + mysql.escape(finishedReminders.reminder_id)), function (error, result) {
                    if (error) throw error;
                    console.log("Reminder ID Recurred: " + finishedReminders.reminder_id);
                }
            }
        }
        catch /*(error)*/ {
            //return console.log(error);
            return;
        }
    }, 1 * 1000);

    setInterval(async function() {
        await binance.prices('DOGEBUSD', (error, ticker) => {
            try {
                client.user.setActivity('DOGE/BUSD: ' + Math.round(parseFloat(ticker.DOGEBUSD) * 1000) / 1000);
                if (parseFloat(ticker.DOGEBUSD) >= 1) {
                    client.channels.cache.get('693408072504442940').send('@everyone DOGECOIN is now $1+');
                }
            }
            catch {
                return console.log(error);
            }
        })
    }, 600 * 1000);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (!client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

/*client.on('collect', async i => {
    if (i.customID === 'snooze') {
        console.log("clicked");
    }
})*/

client.on('voiceStateUpdate', (interaction) => { //Each time voice channel changed
    if (interaction.member.voice.channelId === '441302620574056459') { //Main VC
        interaction.member.roles.add('776935613446094869'); //VC Role
    } else {
        interaction.member.roles.remove('776935613446094869');
    }
});

//Login to Discord with app's token
client.login(token);
