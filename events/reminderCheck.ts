import {
	Client,
	EmbedBuilder,
	Events,
	GuildMember,
	TextChannel,
	time,
	TimestampStyles,
} from 'discord.js';
import { mysqlConnection } from '../index';
import { EventExport, SelectFinishedReminders } from 'types/EventTypes';

const reminderCheckEvent: EventExport = {
	name: Events.ClientReady,

	async execute(client: Client) {
		const checkReminders = async () => {
			const now = Math.floor(new Date().getTime() / 1000);

			// Fetch all reminders due up to now
			const [reminders] = await (
				await mysqlConnection
			).execute<Array<SelectFinishedReminders>>(
				`SELECT id, userId, channelId, message, createdAt, remindAt, repeatInterval, messageUrl
				FROM tbl_Reminders
				WHERE remindAt <= ?`,
				[now],
			);

			for (const reminder of reminders) {
				const channel = await client.channels.fetch(reminder.channelId);
				const user = await client.users.fetch(reminder.userId);
				let guildUser: GuildMember | undefined;
				client.guilds.cache.forEach((guild) => {
					guild.members.cache.find((member) => {
						if (member.user.id === reminder.userId) {
							guildUser = member;
						}
					});
				});

				const embed = new EmbedBuilder()
					.setColor('Blue')
					.setAuthor({
						name:
							guildUser?.displayName === user.username
								? user.username
								: `${guildUser?.displayName} (${user.username})`,
						iconURL: user.displayAvatarURL(),
					})
					.addFields({
						name: reminder.repeatInterval
							? 'Your Repeating Reminder:'
							: 'Your Reminder:',
						value: `${reminder.message}\n`,
					})
					.setFooter({ text: 'Time Set' })
					.setTimestamp(reminder.createdAt * 1000);

				if (reminder.repeatInterval) {
					const next = reminder.remindAt + reminder.repeatInterval;

					embed.addFields({
						name: '\u200b',
						value: `Your reminder will repeat ${time(next, TimestampStyles.RelativeTime)}\n**[Original Message](${reminder.messageUrl})**`,
					});

					await (
						await mysqlConnection
					).execute(
						`UPDATE tbl_Reminders
						SET remindAt = ?
						WHERE id = ?`,
						[next, reminder.id],
					);
				} else {
					embed.addFields({
						name: '\u200b',
						value: `**[Original Message](${reminder.messageUrl})**`,
					});

					await (
						await mysqlConnection
					).execute(
						`DELETE FROM tbl_Reminders
						WHERE id = ?`,
						[reminder.id],
					);
				}

				if (channel?.isTextBased()) {
					(channel as TextChannel).send({
						content: `<@${reminder.userId}>,\n`,
						embeds: [embed],
					});
				}
			}
		};

		await checkReminders();
		setInterval(checkReminders, 1000);
	},
};

export default reminderCheckEvent;
