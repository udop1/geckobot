import { handleDeleteSelect } from '../commands/reminders/deleteReminder';
import {
	AutocompleteInteraction,
	BaseInteraction,
	Events,
	StringSelectMenuInteraction,
} from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(...args: Array<any>) {
		const interaction = args.find((item) => item instanceof BaseInteraction);

		if (interaction?.isChatInputCommand()) {
			const client = interaction.client;
			const command: CommandExport = client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(client, interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}:\n${error}`);
			}
		}

		if (interaction?.isStringSelectMenu()) {
			const selectInteraction: StringSelectMenuInteraction = interaction;

			if (selectInteraction.customId === 'delete_reminder_select') {
				try {
					return await handleDeleteSelect(selectInteraction);
				} catch (error) {
					console.error(`Error handling delete select: ${error}`);
				}
			}
		}

		if (interaction?.isAutocomplete()) {
			const autocompleteInteraction: AutocompleteInteraction = interaction;
			const command: CommandExport = autocompleteInteraction.client.commands.get(
				autocompleteInteraction.commandName,
			);

			try {
				await command.autocomplete(autocompleteInteraction);
			} catch (error) {
				console.error(`Error handling autocomplete: ${error}`);
			}
		}
	},
};

export default interactionCreateEvent;
