import { handleDeleteSelect } from '../commands/reminders/deleteReminder';
import { CommandInteraction, Events, StringSelectMenuInteraction } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(...args: Array<any>) {
		const selectInteraction = args.find(
			(i): i is StringSelectMenuInteraction => i instanceof StringSelectMenuInteraction,
		);

		if (selectInteraction) {
			if (selectInteraction.customId === 'delete_reminder_select') {
				try {
					return await handleDeleteSelect(selectInteraction);
				} catch (error) {
					console.error('Error handling delete select:', error);
				}
			}
		}

		const interaction = args.find((item: CommandInteraction): item is CommandInteraction => {
			return item instanceof CommandInteraction;
		});
		const client = interaction?.client;

		const command: CommandExport = client?.commands.get(interaction?.commandName);

		if (!command) {
			console.error(`No command matching ${interaction?.commandName} was found.`);
			return;
		}

		try {
			await command.execute(client, interaction);
		} catch (error) {
			console.error(`Error executing ${interaction?.commandName}:\n${error}`);
		}
	},
};

export default interactionCreateEvent;
