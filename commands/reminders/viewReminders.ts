import {
	ChatInputCommandInteraction,
	Client,
	EmbedBuilder,
	SlashCommandBuilder,
	time,
	TimestampStyles,
} from 'discord.js';
import { mysqlConnection } from '../../index';
import { CommandExport, SelectViewReminders } from 'types/CommandTypes';

const viewReminders: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('viewreminders')
		.setDescription('View all your created reminders'),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const userId = interaction.user.id;
		const username = interaction.user.username;
		const userDisplayName = interaction.user.displayName;
		const userAvatar = interaction.user.displayAvatarURL();

		// Fetch reminders for user
		const [reminders] = await (
			await mysqlConnection
		).execute<Array<SelectViewReminders>>(
			`SELECT id, message, createdAt, remindAt, repeatInterval, messageUrl
			FROM tbl_Reminders
			WHERE userId = ?
			ORDER BY remindAt`,
			[userId],
		);

		if (!reminders.length) {
			return await interaction.editReply({ content: 'You have no active reminders.' });
		}

		const inlinesPerPage = 9;
		const pages = [];
		for (let i = 0; i < reminders.length; i += inlinesPerPage) {
			pages.push(reminders.slice(i, i + inlinesPerPage));
		}

		for (const [index, page] of pages.entries()) {
			const embed = new EmbedBuilder()
				.setTitle('Your Reminders')
				.setColor('Blue')
				.setAuthor({
					name:
						userDisplayName === username
							? username
							: `${userDisplayName} (${username})`,
					iconURL: userAvatar,
				})
				.setFooter({ text: `Page ${index + 1}/${pages.length}` })
				.setTimestamp();

			for (const reminder of page) {
				embed.addFields({
					name: `ID: ${reminder.id}`,
					value: `Reminder: ${reminder.message}\nCreated: ${time(reminder.createdAt, TimestampStyles.LongDateTime)}\n${reminder.repeatInterval ? 'Next' : 'Ending'}: ${time(reminder.remindAt, TimestampStyles.LongDateTime)}\n${reminder.repeatInterval ? `Repeats ${time(Math.floor(new Date().getTime() / 1000 + reminder.repeatInterval), TimestampStyles.RelativeTime)}\n` : ''}**[Original Message](${reminder.messageUrl})**`,
					inline: true,
				});
			}

			if (index === 0) {
				await interaction.editReply({ embeds: [embed] });
			} else {
				await interaction.followUp({ embeds: [embed] });
			}
		}
	},
};

export default viewReminders;
