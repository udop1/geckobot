import { Client, CommandInteraction, Events } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(...args: any) {
		const interaction: CommandInteraction = args.find(
			(item: any): item is CommandInteraction => {
				return item instanceof CommandInteraction;
			},
		);
		const client: Client = interaction.client;

		const command: CommandExport = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(client, interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}:\n${error}`);
		}
	},
};

export default interactionCreateEvent;
