import { Client, Events, EmbedBuilder, GuildMember, ChannelType } from 'discord.js';
import { mysqlConnection } from '../index';
import { EventExport, FinishedReminders } from 'types/EventTypes';

const reminderCheckEvent: EventExport = {
	name: Events.ClientReady,

	async execute(client: Client) {
		setInterval(async () => {
			// Check reminders
			const getFinishedReminders = async (): Promise<FinishedReminders> => {
				try {
					const getRemindersQuery = `SELECT reminder_id, username, reminder, start_time, recurrence_time, end_duration, channel_in, message_url, is_recurring
					FROM tbl_Reminders
					WHERE ? >= end_duration
					ORDER BY end_duration
					LIMIT 1`;
					const currentTime = new Date().getTime() / 1000;

					const [result] = await (
						await mysqlConnection
					).execute<FinishedReminders[]>(getRemindersQuery, [currentTime]);

					return result[0];
				} catch (error) {
					console.error(`Error fetching finished reminders: ${error}`);

					throw error;
				}
			};

			const finishedReminders = await getFinishedReminders();

			try {
				if (!finishedReminders) {
					return;
				}
				const reminderUser = await client.users.fetch(finishedReminders.username);
				let reminderGuildUser: GuildMember | undefined;
				client.guilds.cache.forEach((guild) => {
					guild.members.cache.find((member) => {
						if (member.user.id === finishedReminders.username) {
							reminderGuildUser = member;
						}
					});
				});

				const isRecurring = finishedReminders.is_recurring;
				const unixTime = finishedReminders.start_time;
				const endTime = finishedReminders.end_duration;
				const recurringTime = endTime + finishedReminders.recurrence_time;

				const dateObject = new Date(unixTime * 1000);
				const months = [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				];
				const year = dateObject.getFullYear();
				const month = months[dateObject.getMonth()];
				const date = dateObject.getDate();
				const hour = dateObject.getHours();
				const min = dateObject.getMinutes();
				const sec = dateObject.getSeconds();
				const time = `${date}/${month}/${year}/${hour}:${min}:${sec}`;

				let embedReminder: EmbedBuilder;
				if (isRecurring == 'false') {
					embedReminder = new EmbedBuilder() //TODO: Add snooze button
						.setColor('#0099ff')
						.setAuthor({
							name:
								reminderGuildUser?.displayName === reminderUser.username
									? reminderUser.username
									: `${reminderGuildUser?.displayName} (${reminderUser.username})`,
							iconURL: reminderUser.displayAvatarURL(),
						})
						.addFields(
							{
								name: 'Your Reminder:',
								value: `${finishedReminders.reminder}\n`,
							},
							{
								name: '\u200b',
								value: `**[Original Message](${finishedReminders.message_url})**`,
							},
						)
						.setFooter({ text: 'Time Set' })
						.setTimestamp(Date.parse(time));

					const channel = client.channels.cache.get(finishedReminders.channel_in);
					if (channel?.type === ChannelType.GuildText) {
						channel.send({
							content: `<@${finishedReminders.username}>,\n`,
							embeds: [embedReminder] /*, components: [buttonRow]*/,
						});
					}

					try {
						const deleteQuery = `DELETE FROM tbl_Reminders
						WHERE reminder_id = ?`;
						const deleteValues = [finishedReminders.reminder_id];

						await (await mysqlConnection).query(deleteQuery, deleteValues);

						console.log(`Reminder ID Ended: ${finishedReminders.reminder_id}`);
					} catch (error) {
						console.log(`Error deleting reminder: ${error}`);
					}
				} else if (isRecurring == 'true') {
					embedReminder = new EmbedBuilder()
						.setColor('#0099ff')
						.setAuthor({
							name:
								reminderGuildUser?.displayName === reminderUser.username
									? reminderUser.username
									: `${reminderGuildUser?.displayName} (${reminderUser.username})`,
							iconURL: reminderUser.displayAvatarURL(),
						})
						.addFields(
							{
								name: 'Your Recurring Reminder:',
								value: `${finishedReminders.reminder}\n`,
							},
							{
								name: '\u200b',
								value: `**[Original Message](${finishedReminders.message_url})**`,
							},
						)
						.setFooter({ text: 'Time Set' })
						.setTimestamp(Date.parse(time));

					const channel = client.channels.cache.get(finishedReminders.channel_in);
					if (channel?.type === ChannelType.GuildText) {
						channel.send({
							content: `<@${finishedReminders.username}>,\n`,
							embeds: [embedReminder],
						});
					}

					try {
						const updateReminderQuery = `UPDATE tbl_Reminders
						SET start_time = ?, end_duration = ?
						WHERE reminder_id = ?`;
						const updateReminderValues = [
							Math.trunc(new Date().getTime() / 1000),
							recurringTime,
							finishedReminders.reminder_id,
						];

						await (
							await mysqlConnection
						).query(updateReminderQuery, updateReminderValues);

						console.log(`Reminder ID Recurred: ${finishedReminders.reminder_id}`);
					} catch (error) {
						console.error(`Error updating reminders: ${error}`);
						throw error;
					}
				}
			} catch (error) {
				return console.log(error);
			}
		}, 1000);
	},
};

export default reminderCheckEvent;
