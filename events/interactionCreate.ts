import { BaseInteraction, Client, Events, GuildMember } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(client: Client, interaction: BaseInteraction) {
		if (!interaction.isChatInputCommand()) return;

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
