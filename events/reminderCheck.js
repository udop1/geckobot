const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
	name: Events.ClientReady,

	async execute() {
		const { client, mysql } = require("../index");

		setInterval(async function () {
			//Check reminders
			var currentTime = new Date().getTime() / 1000;
			var finishedReminders;

			var getFinishedReminders = function () {
				let promise = new Promise(function (resolve) {
					setTimeout(function () {
						mysql.query(
							`SELECT reminder_id, username, reminder, start_time, recurrence_time, end_duration, channel_in, message_url, is_recurring FROM tbl_Reminders WHERE ${mysql.escape(
								currentTime
							)} >= end_duration ORDER BY end_duration LIMIT 1`,
							function (error, result) {
								if (error) throw error;
								resolve(result[0]);
							}
						);
					}, 1000);
				});
				return promise;
			};

			finishedReminders = await getFinishedReminders();

			try {
				if (!finishedReminders) {
					return;
				}
				var reminderUser = await client.users.fetch(finishedReminders.username);
				var reminderGuildUser;
				client.guilds.cache.forEach((guild) => {
					guild.members.cache.find((member) => {
						if (member.user.id === finishedReminders.username) {
							reminderGuildUser = member;
						}
					});
				});

				var isRecurring = finishedReminders.is_recurring;
				var unixTime = finishedReminders.start_time;
				var endTime = finishedReminders.end_duration;
				var recurringTime = endTime + finishedReminders.recurrence_time;

				var dateObject = new Date(unixTime * 1000);
				var months = [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				];
				var year = dateObject.getFullYear();
				var month = months[dateObject.getMonth()];
				var date = dateObject.getDate();
				var hour = dateObject.getHours();
				var min = dateObject.getMinutes();
				var sec = dateObject.getSeconds();
				var time = `${date}/${month}/${year}/${hour}:${min}:${sec}`;

				var embedReminder;
				if (isRecurring == "false") {
					embedReminder = new EmbedBuilder() //ADD SNOOZE BUTTON TO THIS
						.setColor("#0099ff")
						.setAuthor({
							name:
								reminderGuildUser.displayName === reminderUser.username
									? reminderUser.username
									: `${reminderGuildUser.displayName} (${reminderUser.username})`,
							iconURL: reminderUser.displayAvatarURL(),
						})
						.addFields(
							{
								name: "Your Reminder:",
								value: `${finishedReminders.reminder}\n`,
							},
							{
								name: "\u200b",
								value: `**[Original Message](${finishedReminders.message_url})**`,
							}
						)
						.setFooter({ text: "Time Set" })
						.setTimestamp(Date.parse(time));

					client.channels.cache.get(finishedReminders.channel_in).send({
						content: `<@${finishedReminders.username}>,\n`,
						embeds: [embedReminder] /*, components: [buttonRow]*/,
					});

					mysql.query(
						`DELETE FROM tbl_Reminders WHERE reminder_id = ${mysql.escape(
							finishedReminders.reminder_id
						)}`,
						function (error) {
							if (error) throw error;
							console.log(`Reminder ID Ended: ${finishedReminders.reminder_id}`);
						}
					);
				} else if (isRecurring == "true") {
					embedReminder = new EmbedBuilder()
						.setColor("#0099ff")
						.setAuthor({
							name:
								reminderGuildUser.displayName === reminderUser.username
									? reminderUser.username
									: `${reminderGuildUser.displayName} (${reminderUser.username})`,
							iconURL: reminderUser.displayAvatarURL(),
						})
						.addFields(
							{
								name: "Your Recurring Reminder:",
								value: `${finishedReminders.reminder}\n`,
							},
							{
								name: "\u200b",
								value: `**[Original Message](${finishedReminders.message_url})**`,
							}
						)
						.setFooter({ text: "Time Set" })
						.setTimestamp(Date.parse(time));

					client.channels.cache.get(finishedReminders.channel_in).send({
						content: `<@${finishedReminders.username}>,\n`,
						embeds: [embedReminder],
					});

					mysql.query(
						`UPDATE tbl_Reminders SET start_time = ${mysql.escape(
							Math.trunc(new Date().getTime() / 1000)
						)}, end_duration = ${mysql.escape(
							recurringTime
						)} WHERE reminder_id = ${mysql.escape(finishedReminders.reminder_id)}`
					),
						function (error) {
							if (error) throw error;
							console.log(`Reminder ID Recurred: ${finishedReminders.reminder_id}`);
						};
				}
			} catch (error) {
				return console.log(error);
			}
		}, 1 * 1000);
	},
};
