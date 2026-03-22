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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
				.setName('timezone')
				.setDescription('Optional: specific timezone')
				.setRequired(false)
				.addChoices(
					{ name: 'EST', value: 'America/New_York' },
					{ name: 'CST', value: 'America/Chicago' },
					{ name: 'MST', value: 'America/Denver' },
					{ name: 'PST', value: 'America/Los_Angeles' },
				),
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
		const timezoneInput = interaction.options.getString('timezone', false);
		const repeatInput = interaction.options.getString('repeat', false);

		// Parse whenInput
		let remindAt: number;
		try {
			remindAt = parseDate(whenInput);
		} catch {
			return interaction.reply({
				content: 'Could not parse the date/time. Please use a valid format.',
				flags: MessageFlags.Ephemeral,
			});
		}

		// Parse timezone
		if (timezoneInput) {
			const givenDate = dayjs(dayjs.unix(remindAt)).tz(timezoneInput, true);
			const convertedDate = givenDate.tz(dayjs.tz.guess());

			remindAt = convertedDate.unix();
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
					Math.floor(Date.now() / 1000),
					messageUrl,
				],
			);

			if (result.affectedRows > 0) {
				return await interaction.editReply({
					content: `Your reminder for ${time(remindAt, TimestampStyles.FullDateShortTime)}${repeatInterval ? `, that will next repeat on ${time(repeatInterval + remindAt, TimestampStyles.FullDateShortTime)},` : ''} has been set.`,
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
