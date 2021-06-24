//Require Node's native file system module
const fs = require('fs');

//Require the discord.js module
const Discord = require('discord.js');

//Require the sequelize module
const Sequelize = require('sequelize');

//Require the MySQL module
const MySQL = require('mysql');

//Require the config.json file
const {prefix, token, APIKEY, APISECRET, HOST, USER, PASSWORD, DATABASE} = require('./config.json');
const { finished } = require('stream');

//Require Binance API
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: `${APIKEY}`,
    APISECRET: `${APISECRET}`,
    useServerTime: true,
});

//Create a new Discord client, commands Collection, and cooldowns Collection
const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

//Returns an array of all file names in that directory with the JavaScript file extension
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    //Create a new item in the Collection with the key set as the command's name and the value as the exported module
    client.commands.set(command.name, command);
}

//Database connection info
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

//Database connection info
const mysql = MySQL.createConnection({
    host: `${HOST}`,
    user: `${USER}`,
    password: `${PASSWORD}`,
    database: `${DATABASE}`
});

//Creating database tables
var Reminders = sequelize.define('tbl_Reminders', {
    reminder_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    reminder: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    start_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    end_duration: { //In UNIX seconds
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    channel_in: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    message_url: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
});
module.exports.Reminders = Reminders;
module.exports.mysql = mysql;
module.exports.binance = binance;

//Once client is ready, trigger code once after logging in
client.once('ready', () => {
    Reminders.sync();
    console.log('RemindMe! Bot is online.');
});

client.on('ready', () => { //Once client is ready
    //const Op = Sequelize.Op;

    setInterval(async function() { //Check reminders
        var currentTime = new Date().getTime() / 1000;
        //var finishedReminders = await Reminders.findOne({attributes: ['reminder_id', 'username', 'reminder', 'start_time', 'channel_in', 'message_url'], group: ['end_duration'], having: {end_duration: {[Op.lte]: currentTime}}}); //currentTime >= end_duration
        var finishedReminders;

        var getFinishedReminders = function() {
            let promise = new Promise(function(resolve, reject) {
                setTimeout(function() {
                    mysql.query("SELECT reminder_id, username, reminder, start_time, channel_in, message_url FROM tbl_Reminders WHERE " + mysql.escape(currentTime) + " >= end_duration ORDER BY end_duration LIMIT 1", function (error, result, fields) {
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
            var unixTime = finishedReminders.start_time;
            var dateObject = new Date(unixTime * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = dateObject.getFullYear();
            var month = months[dateObject.getMonth()];
            var date = dateObject.getDate();
            var hour = dateObject.getHours();
            var min = dateObject.getMinutes();
            var sec = dateObject.getSeconds();
            var time = date + '/' + month + '/' + year + '/' + hour + ':' + min + ':' + sec ;

            var embedReminder = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(`${reminderUser.tag}`, reminderUser.displayAvatarURL({dynamic: true}))
            .addFields(
                {name: 'Your Reminder:', value: `${finishedReminders.reminder}\n`},
                {name: '\u200b', value: `**[Original Message](${finishedReminders.message_url})**`}
            )
            .setFooter('Time Set')
            .setTimestamp(time);

            client.channels.cache.get(`${finishedReminders.channel_in}`).send('<@'+finishedReminders.username+'>,\n', embedReminder);

            //client.channels.cache.get(`${finishedReminders.channel_in}`).send(`${finishedReminders.reminder_id}\n${finishedReminders.username}\n${finishedReminders.reminder}\n${finishedReminders.start_time}`);
            //await Reminders.destroy({where: {reminder_id: finishedReminders.reminder_id}});
            mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(finishedReminders.reminder_id), function (error, result) {
                if (error) throw error;
                console.log("Reminder ID Ended: " + finishedReminders.reminder_id);
            });
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
                //client.channels.cache.get('673976443956363275').send('DOGE/BUSD: ' + Math.round(parseFloat(ticker.DOGEBUSD) * 1000) / 1000);
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

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    //If there is no command with the specified name, exit early
    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    //If the command is not on the Collection list, get the current time, record the command used, if a cooldown isn't already specified default to 3 and convert to milliseconds, then get the user's id and combine it with the expiration timestamp
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        //If the expirationTime has not passed, return a message letting the user know how much time is left
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    //If the Collection doesn't have the user's id, set the user's id with the current timestamp and set a timeout to automatically delete it after the cooldown period has passed
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        //If there is a command with the specified name, run it
        command.execute(message, args);
    } catch (error) {
        //If something goes wrong, log the error
        console.error(error);
        message.reply('There was an error trying to execute that command!\nError:\n\`' + error + '\`');
    }
});

client.on('voiceStateUpdate', (message) => { //Each time voice channel changed
    /*if (client.channels.cache.get('441302620574056459').members(0)) {
        
    }*/
    if (message.member.voice.channelID === '441302620574056459') { //Main VC
        message.member.roles.add('776935613446094869');
        //client.channels.cache.get('482639990812311583').send(client.channels.cache.get('441302620574056459').members());
    } else {
        message.member.roles.remove('776935613446094869');
    }
});

//Login to Discord with app's token
client.login(token);
