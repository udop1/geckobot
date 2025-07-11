import {
	ChatInputCommandInteraction,
	Client,
	MessageFlags,
	SlashCommandBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuInteraction,
} from 'discord.js';
import { mysqlConnection } from '../../index';
import { CommandExport, SelectDeleteReminder } from 'types/CommandTypes';

const deleteReminder: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('deletereminder')
		.setDescription('Delete one of your reminders'),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;

		// Fetch reminders for user
		const [reminders] = await (
			await mysqlConnection
		).execute<Array<SelectDeleteReminder>>(
			`SELECT id, message, remindAt, repeatInterval
			FROM tbl_Reminders
			WHERE userId = ?`,
			[userId],
		);

		if (!reminders.length) {
			return interaction.reply({
				content: 'You have no reminders to delete.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const menu = new StringSelectMenuBuilder()
			.setCustomId('delete_reminder_select')
			.setPlaceholder('Select a reminder to delete')
			.addOptions(
				reminders.map((reminder) => ({
					label: reminder.message.slice(0, 100),
					description: `ID: ${reminder.id}`,
					value: String(reminder.id),
				})),
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

		await interaction.reply({
			content: 'Select a reminder to delete:',
			components: [row],
			flags: MessageFlags.Ephemeral,
		});
	},
};

export const handleDeleteSelect = async (interaction: StringSelectMenuInteraction) => {
	if (interaction.customId !== 'delete_reminder_select') return;

	const reminderId = Number(interaction.values[0]);
	const userId = interaction.user.id;

	// Delete from database
	await (
		await mysqlConnection
	).execute(
		`DELETE FROM tbl_Reminders
		WHERE id = ? AND userId = ?`,
		[reminderId, userId],
	);

	await interaction.update({
		content: `Reminder ${reminderId} has been deleted!`,
		components: [],
	});
};

export default deleteReminder;
