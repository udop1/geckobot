//Setup dependencies
const fs = require('fs');
const path = require('path');
const MySQL = require('mysql2');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

//Initialise clients
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildIntegrations,
	],
});

client.commands = new Collection();

//Retrieve all commands
const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.warn(
				`The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

//Update all commands
const rest = new REST().setToken(process.env.TOKEN);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands }
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

//Database connection
const mysql = MySQL.createConnection({
	host: `${process.env.HOST}`,
	user: `${process.env.USER}`,
	password: `${process.env.PASSWORD}`,
	database: `${process.env.DATABASE}`,
});

//Exports
module.exports.client = client;
module.exports.mysql = mysql;
module.exports.rest = rest;
module.exports.Routes = Routes;

//Event handlers
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//Connect client to Discord
client.login(process.env.TOKEN);
