import { ChatInputCommandInteraction, Client, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { mysqlConnection } from '../../index';
import { parseDate, parseDuration } from '../../utils/utils';
import { CommandExport } from 'types/CommandTypes';

const createReminder: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('addreminder')
		.setDescription('Create a new reminder')
		.addStringOption((option) =>
			option.setName('message').setDescription('The reminder message').setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('when')
				.setDescription(
					'When to remind: specific date/time (e.g. 24/06/2026 12:30) or relative (e.g. 3d, 30m)',
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('repeat')
				.setDescription('Optional: repeat interval (e.g. 1d, 2h)')
				.setRequired(false),
		),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		const channelId = interaction.channelId;
		const message = interaction.options.getString('message', true);
		const whenInput = interaction.options.getString('when', true);
		const repeatInput = interaction.options.getString('repeat', false);

		// Parse `whenInput` into a JS Date object
		let remindAt: Date;
		try {
			remindAt = parseDate(whenInput);
		} catch {
			return interaction.reply({
				content: 'Could not parse the date/time. Please use a valid format.',
				flags: MessageFlags.Ephemeral,
			});
		}

		// Parse repeatInput into milliseconds (optional)
		let repeatInterval: number | null = null;
		if (repeatInput) {
			try {
				repeatInterval = parseDuration(repeatInput);
			} catch {
				return interaction.reply({
					content:
						'Could not parse the repeat interval. Use formats like `1d`, `2h`, `30m`.',
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		// Save to database
		const [result] = await (
			await mysqlConnection
		).execute(
			`INSERT INTO tbl_Test (userId, channelId, message, remindAt, repeatInterval, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
			[userId, channelId, message, remindAt, repeatInterval, new Date()],
		);
		const insertId = (result as any).insertId;

		await interaction.reply({
			content: `Reminder set (ID: ${insertId}) for ${remindAt.toUTCString()}${repeatInterval ? ` repeating every ${repeatInput}` : ''}.`,
			flags: MessageFlags.Ephemeral,
		});
	},
};

export default createReminder;
