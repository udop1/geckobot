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
import { CommandExport } from 'types/CommandTypes';

const deleteReminder: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('deletereminder')
		.setDescription('Delete one of your reminders'),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;

		// Fetch reminders for user
		const [rows] = await (
			await mysqlConnection
		).execute(`SELECT id, message, remindAt, repeatInterval FROM tbl_Test WHERE userId = ?`, [
			userId,
		]);
		const reminders = rows as Array<{
			id: number;
			message: string;
			remindAt: Date;
			repeatInterval: number | null;
		}>;

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
				reminders.map((r) => ({
					label: r.message.slice(0, 100),
					description: `At ${r.remindAt.toUTCString()}`,
					value: String(r.id),
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
	).execute(`DELETE FROM tbl_Test WHERE id = ? AND userId = ?`, [reminderId, userId]);

	await interaction.update({ content: `Reminder deleted. (ID: ${reminderId})`, components: [] });
};

export default deleteReminder;
