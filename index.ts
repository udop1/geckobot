// Setup dependencies
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import MySQL, { ConnectionOptions } from 'mysql2/promise';
import {
	Client,
	Collection,
	GatewayIntentBits,
	REST,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	Routes,
} from 'discord.js';
import { CommandModule } from 'types/CommandTypes';
import { EventModule } from 'types/EventTypes';
dotenv.config();

// Initialise clients
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildIntegrations,
	],
});

client.commands = new Collection();

// Retrieve all commands
const commands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const commandModule: CommandModule = require(filePath);
		const command = commandModule.default;

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} else {
			console.warn(
				`The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

// Update all commands
export const rest: REST = new REST().setToken(process.env.TOKEN);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const response = (await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commands },
		)) as Array<RESTPostAPIChatInputApplicationCommandsJSONBody>;

		console.log(`Successfully reloaded ${response.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();

// Database connection
const mysqlOptions: ConnectionOptions = {
	host: `${process.env.HOST}`,
	user: `${process.env.USER}`,
	password: `${process.env.PASSWORD}`,
	database: `${process.env.DATABASE}`,
};
export const mysqlConnection = MySQL.createConnection(mysqlOptions);

// Event handlers
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const eventModule: EventModule = require(filePath);
	const event = eventModule.default;

	if (event.once) {
		client.once(event.name, (...args: any) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any) => event.execute(...args));
	}
}

// Connect client to Discord
client.login(process.env.TOKEN);
