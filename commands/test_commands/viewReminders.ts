import {
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	MessageFlags,
	SlashCommandBuilder,
} from 'discord.js';
import { mysqlConnection } from '../../index';
import { CommandExport } from 'types/CommandTypes';
import dayjs from 'dayjs';
import { msToReadable } from '../../utils/utils';

const viewReminders: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('viewreminders')
		.setDescription('View all your created reminders'),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		const userId = interaction.user.id;

		// Fetch reminders for user
		const [rows] = await (
			await mysqlConnection
		).execute(
			`SELECT id, message, createdAt, remindAt, repeatInterval FROM tbl_Test WHERE userId = ?`,
			[userId],
		);
		const reminders = rows as Array<{
			id: number;
			message: string;
			createdAt: Date;
			remindAt: Date;
			repeatInterval: number | null;
		}>;

		if (!reminders.length) {
			return interaction.reply({
				content: 'You have no active reminders.',
				flags: MessageFlags.Ephemeral,
			});
		}

		const embed = new EmbedBuilder().setTitle('Your Reminders').setColor('Blue');

		for (const r of reminders) {
			embed.addFields({
				name: r.message.slice(0, 256),
				value:
					`ID: ${r.id}\n` +
					`Created: ${dayjs(r.createdAt).toDate().toUTCString()}\n` +
					`Next: ${dayjs(r.remindAt).toDate().toUTCString()}\n` +
					`${r.repeatInterval ? `Repeat every ${msToReadable(r.repeatInterval)}\n` : ''}`,
			});
		}

		await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
	},
};

export default viewReminders;
