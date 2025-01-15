import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { mysqlConnection } from 'index';
import { CommandExport } from 'types/CommandTypes';

const viewremindersCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('viewreminders')
		.setDescription('View all your created reminders'),

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const messageOwner = interaction.user.id;

		try {
			const getAllReminders = async () => {
				try {
					const getRemindersQuery = `SELECT reminder_id, reminder, start_time, end_duration, message_url, is_recurring
					FROM tbl_Reminders
					WHERE username = ?
					ORDER BY end_duration`;
					const getRemindersValues = [messageOwner];

					const [result] = await (
						await mysqlConnection
					).query(getRemindersQuery, getRemindersValues);

					return result[0];
				} catch (error) {
					console.error(`Error fetching reminders: ${error}`);

					throw error;
				}
			};
			const findReminders = await getAllReminders();

			const nthAmount = 9; //How many reminders per page (max per embed: 25)
			const reminderArrayID = findReminders.map((t: any) => t.reminder_id);
			const reminderArrayReminder = findReminders.map((t: any) => t.reminder);
			const reminderArrayStart = findReminders.map((t: any) => t.start_time);
			const reminderArrayEnd = findReminders.map((t: any) => t.end_duration);
			const reminderArrayURL = findReminders.map((t: any) => t.message_url);
			const reminderArrayRecurring = findReminders.map((t: any) => t.is_recurring);

			const splitArrayID = Array.from(
				{ length: Math.ceil(reminderArrayID.length / nthAmount) },
				() => reminderArrayID.splice(0, nthAmount),
			);
			const splitArrayReminder = Array.from(
				{ length: Math.ceil(reminderArrayReminder.length / nthAmount) },
				() => reminderArrayReminder.splice(0, nthAmount),
			);
			const splitArrayStart = Array.from(
				{ length: Math.ceil(reminderArrayStart.length / nthAmount) },
				() => reminderArrayStart.splice(0, nthAmount),
			);
			const splitArrayEnd = Array.from(
				{ length: Math.ceil(reminderArrayEnd.length / nthAmount) },
				() => reminderArrayEnd.splice(0, nthAmount),
			);
			const splitArrayURL = Array.from(
				{ length: Math.ceil(reminderArrayURL.length / nthAmount) },
				() => reminderArrayURL.splice(0, nthAmount),
			);
			const splitArrayRecurring = Array.from(
				{ length: Math.ceil(reminderArrayRecurring.length / nthAmount) },
				() => reminderArrayRecurring.splice(0, nthAmount),
			);
			console.log(splitArrayID);
			const reminderUser = interaction.client.users.cache.get(messageOwner);
			const reminderGuildUser = interaction.guild.members.cache.get(messageOwner);

			let embeddedReminder: Array<EmbedBuilder> = [];
			let firstEmbed = true;
			if (splitArrayID.length > 0) {
				for (let i = 0; i < splitArrayID.length; i++) {
					embeddedReminder[i] = new EmbedBuilder();
					embeddedReminder[i].setColor('#0099ff');
					embeddedReminder[i].setTitle('Your Reminders:');
					embeddedReminder[i].setAuthor({
						name:
							reminderGuildUser.displayName === reminderUser.username
								? reminderUser.username
								: `${reminderGuildUser.displayName} (${reminderUser.username})`,
						iconURL: reminderUser.displayAvatarURL(),
					});
					embeddedReminder[i].setFooter({ text: `Page ${i + 1}` });
					embeddedReminder[i].setTimestamp();

					for (let j = 0; j < splitArrayID[i].length; j++) {
						const startDateObject = new Date(splitArrayStart[i][j] * 1000);
						const endDateObject = new Date(splitArrayEnd[i][j] * 1000);
						const startYear = startDateObject.getFullYear();
						const endYear = endDateObject.getFullYear();
						const startMonth = ('0' + (startDateObject.getMonth() + 1)).slice(-2); //+1 to month to make it correct
						const endMonth = ('0' + (endDateObject.getMonth() + 1)).slice(-2); //+1 to month to make it correct
						const startDate = ('0' + startDateObject.getDate()).slice(-2);
						const endDate = ('0' + endDateObject.getDate()).slice(-2);
						const startHour = ('0' + startDateObject.getHours()).slice(-2);
						const endHour = ('0' + endDateObject.getHours()).slice(-2);
						const startMin = ('0' + startDateObject.getMinutes()).slice(-2);
						const endMin = ('0' + endDateObject.getMinutes()).slice(-2);
						const startSec = ('0' + startDateObject.getSeconds()).slice(-2);
						const endSec = ('0' + endDateObject.getSeconds()).slice(-2);
						const startTime = `${startDate}/${startMonth}/${startYear} at ${startHour}:${startMin}:${startSec}`;
						const endTime = `${endDate}/${endMonth}/${endYear} at ${endHour}:${endMin}:${endSec}`;

						embeddedReminder[i].addFields({
							name: `ID: ${splitArrayID[i][j]}`,
							value: `Reminder: ${splitArrayReminder[i][j]}\nStart: ${startTime}\nEnd: ${endTime}\nRecurring: ${splitArrayRecurring[i][j]}\n**[Original Message](${splitArrayURL[i][j]})**`,
							inline: true,
						});
					}
					if (firstEmbed) {
						await interaction.editReply({ embeds: [embeddedReminder[i]] });
						firstEmbed = false;
					} else {
						await interaction.followUp({ embeds: [embeddedReminder[i]] });
					}
				}
			} else {
				return await interaction.editReply({
					content: 'You have no reminders! Set one using the `addreminder` command.',
				});
			}
		} catch (error) {
			return console.log(error);
		}
	},
};

export default viewremindersCommand;
