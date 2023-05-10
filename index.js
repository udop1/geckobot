//Require Node's native file system module
const fs = require("fs");

//Require the discord.js module
const { Client, Collection, GatewayIntentBits, EmbedBuilder, Routes } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Player, QueryType, QueueRepeatMode } = require("discord-player");
const { lyricsExtractor } = require("@discord-player/extractor");

//Require the MySQL module
const MySQL = require("mysql");

//Require the config.json file
const { token, HOST, USER, PASSWORD, DATABASE } = require("./config.json");

//Create a new Discord client, and commands Collection Collection
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildIntegrations] });
client.commands = new Collection();

//Create a new Discord Player
const player = new Player(client);
const lyricsClient = lyricsExtractor();

//Returns an array of all file names in that directory with the JavaScript file extension
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	//Create a new item in the Collection with the key set as the command's name and the value as the exported module
	client.commands.set(command.name, command);
}

const commands = client.commands.map(({ execute, ...data }) => data);
const rest = new REST({ version: "10" }).setToken(token);

//Update slash commands
(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(Routes.applicationGuildCommands("666645858288140299", "441302620125003788"), { body: commands });

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

//Database connection info
const mysql = MySQL.createConnection({
	host: `${HOST}`,
	user: `${USER}`,
	password: `${PASSWORD}`,
	database: `${DATABASE}`,
});

module.exports.mysql = mysql;
module.exports.rest = rest;
module.exports.Routes = Routes;
module.exports.commands = commands;
module.exports.player = player;
module.exports.QueryType = QueryType;
module.exports.QueueRepeatMode = QueueRepeatMode;
module.exports.lyricsClient = lyricsClient;

//Once client is ready, trigger code once after logging in
client.once("ready", () => {
	console.log("GeckoBot is online.");
});

//Discord Player handlers
player.on("error", (error) => {
	console.log(`General error: ${error}`);
});
player.on("connectionError", (error) => {
	console.log(`Connection error: ${error}`);
});

client.on("ready", () => {
	//Once client is ready
	setInterval(async function () {
		//Check reminders
		var currentTime = new Date().getTime() / 1000;
		var finishedReminders;

		var getFinishedReminders = function () {
			let promise = new Promise(function (resolve, reject) {
				setTimeout(function () {
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
			if (!finishedReminders) {
				return;
			}
			var reminderUser = await client.users.fetch(finishedReminders.username);
			var isRecurring = finishedReminders.is_recurring;
			var unixTime = finishedReminders.start_time;
			var endTime = finishedReminders.end_duration;
			var recurringTime = endTime + finishedReminders.recurrence_time;

			var dateObject = new Date(unixTime * 1000);
			var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var year = dateObject.getFullYear();
			var month = months[dateObject.getMonth()];
			var date = dateObject.getDate();
			var hour = dateObject.getHours();
			var min = dateObject.getMinutes();
			var sec = dateObject.getSeconds();
			var time = date + "/" + month + "/" + year + "/" + hour + ":" + min + ":" + sec;

			if (isRecurring == "false") {
				var embedReminder = new EmbedBuilder() //ADD SNOOZE BUTTON TO THIS
					.setColor("#0099ff")
					.setAuthor({ name: `${reminderUser.tag}`, iconURL: reminderUser.displayAvatarURL({ dynamic: true }) })
					.addFields({ name: "Your Reminder:", value: `${finishedReminders.reminder}\n` }, { name: "\u200b", value: `**[Original Message](${finishedReminders.message_url})**` })
					.setFooter({ text: "Time Set" })
					.setTimestamp(Date.parse(time));

				client.channels.cache.get(`${finishedReminders.channel_in}`).send({ content: "<@" + finishedReminders.username + ">,\n", embeds: [embedReminder] /*, components: [buttonRow]*/ });

				mysql.query("DELETE FROM tbl_Reminders WHERE reminder_id = " + mysql.escape(finishedReminders.reminder_id), function (error, result) {
					if (error) throw error;
					console.log("Reminder ID Ended: " + finishedReminders.reminder_id);
				});
			} else if (isRecurring == "true") {
				var embedReminder = new EmbedBuilder()
					.setColor("#0099ff")
					.setAuthor({ name: `${reminderUser.tag}`, iconURL: reminderUser.displayAvatarURL({ dynamic: true }) })
					.addFields({ name: "Your Recurring Reminder:", value: `${finishedReminders.reminder}\n` }, { name: "\u200b", value: `**[Original Message](${finishedReminders.message_url})**` })
					.setFooter({ text: "Time Set" })
					.setTimestamp(Date.parse(time));

				client.channels.cache.get(`${finishedReminders.channel_in}`).send({ content: "<@" + finishedReminders.username + ">,\n", embeds: [embedReminder] });

				mysql.query("UPDATE tbl_Reminders SET start_time = " + mysql.escape(Math.trunc(new Date().getTime() / 1000)) + " , end_duration = " + mysql.escape(recurringTime) + " WHERE reminder_id = " + mysql.escape(finishedReminders.reminder_id)),
					function (error, result) {
						if (error) throw error;
						console.log("Reminder ID Recurred: " + finishedReminders.reminder_id);
					};
			}
		} catch (error) {
			return console.log(error);
		}
	}, 1 * 1000);
});

//Command handler
client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (!client.commands.has(interaction.commandName)) return;

	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
	}
});

//Login to Discord with app's token
client.login(token);
