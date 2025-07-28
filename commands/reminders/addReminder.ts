import {
	ChatInputCommandInteraction,
	Client,
	MessageFlags,
	SlashCommandBuilder,
	time,
	TimestampStyles,
} from 'discord.js';
import { mysqlConnection } from '../../index';
import { parseDate, parseDuration } from '../../utils/utils';
import { CommandExport } from 'types/CommandTypes';
import { ResultSetHeader } from 'mysql2';

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
					'When to remind: specific date/time (e.g. `24/06/2026 12:30`) or relative (e.g. `3d 30m`)',
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('repeat')
				.setDescription('Optional: repeat interval (e.g. `1d 2h`)')
				.setRequired(false),
		),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;
		const channelId = interaction.channelId;
		const message = interaction.options.getString('message', true);
		const whenInput = interaction.options.getString('when', true);
		const repeatInput = interaction.options.getString('repeat', false);

		// Parse `whenInput`
		let remindAt: number;
		try {
			remindAt = parseDate(whenInput);
		} catch {
			return interaction.reply({
				content: 'Could not parse the date/time. Please use a valid format.',
				flags: MessageFlags.Ephemeral,
			});
		}

		// Parse repeatInput
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

			if (repeatInterval < 21600) {
				return interaction.reply({
					content: "Your recurring reminder can't end before 6 hours.",
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		try {
			await interaction.deferReply();
			const messageUrl = (await interaction.fetchReply()).url;

			// Save to database
			const [result] = await (
				await mysqlConnection
			).execute<ResultSetHeader>(
				`INSERT INTO tbl_Reminders (userId, channelId, message, remindAt, repeatInterval, createdAt, messageUrl)
				VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					userId,
					channelId,
					message,
					remindAt,
					repeatInterval,
					Math.floor(new Date().getTime() / 1000),
					messageUrl,
				],
			);

			if (result.affectedRows > 0) {
				return await interaction.editReply({
					content: `Your reminder for ${time(remindAt, TimestampStyles.LongDateTime)}${repeatInterval ? ` that repeats ${time(Math.floor(new Date().getTime() / 1000 + repeatInterval), TimestampStyles.RelativeTime)}` : ''} has been set.`,
				});
			} else {
				console.error('Failed to insert reminder to database.');
				throw new Error('Failed to insert reminder to database.');
			}
		} catch (error) {
			console.error(`Error inserting reminders: ${error}`);
			return await interaction.editReply({
				content: 'Error adding reminder.',
			});
		}
	},
};

export default createReminder;
