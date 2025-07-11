import { Client, Events, TextChannel } from 'discord.js';
import { mysqlConnection } from '../index';
import { EventExport } from 'types/EventTypes';

const reminderCheckerEvent: EventExport = {
	name: Events.ClientReady,

	async execute(client: Client) {
		const checkReminders = async () => {
			const now = new Date();

			// Fetch all reminders due up to now
			const [rows] = await (
				await mysqlConnection
			).execute(
				`SELECT id, userId, channelId, message, remindAt, repeatInterval FROM tbl_Test WHERE remindAt <= ?`,
				[now],
			);
			const reminders = rows as Array<{
				id: number;
				userId: string;
				channelId: string;
				message: string;
				remindAt: Date;
				repeatInterval: number | null;
			}>;

			for (const r of reminders) {
				const channel = await client.channels.fetch(r.channelId);

				if (channel?.isTextBased()) {
					(channel as TextChannel)
						.send(`<@${r.userId}>, **Reminder:** ${r.message}`)
						.catch(console.error);
				}

				if (r.repeatInterval) {
					const next = new Date(new Date(r.remindAt).getTime() + r.repeatInterval);

					await (
						await mysqlConnection
					).execute(`UPDATE tbl_Test SET remindAt = ? WHERE id = ?`, [next, r.id]);
				} else {
					await (
						await mysqlConnection
					).execute(`DELETE FROM tbl_Test WHERE id = ?`, [r.id]);
				}
			}
		};

		await checkReminders();
		setInterval(checkReminders, 1000);
	},
};

export default reminderCheckerEvent;
