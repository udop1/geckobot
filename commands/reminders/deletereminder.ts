import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { mysqlConnection } from 'index';
import { CommandExport } from 'types/CommandTypes';

const deletereminderCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('deletereminder')
		.setDescription('Delete a created reminder')
		.addIntegerOption((option) =>
			option.setName('id').setDescription('Reminder ID').setRequired(true),
		),

	async execute(client: Client, interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();

		const messageOwner = interaction.user.id;
		const reminderID = interaction.options.getInteger('id');

		try {
			const deleteQuery = `DELETE FROM tbl_Reminders
			WHERE reminder_id = ?
			AND username = ?`;
			const deleteValues = [reminderID, messageOwner];

			const [result] = await (await mysqlConnection).query(deleteQuery, deleteValues);

			if (result.affectedRows == 0) {
				return interaction.editReply({
					content: "You don't have a reminder with that ID.",
				});
			} else {
				console.log(`Reminder ID Deleted: ${reminderID}`);
				return interaction.editReply({
					content: `Reminder ${reminderID} has been deleted!`,
				});
			}
		} catch (error) {
			console.log(`Error deleting reminders: ${error}`);
			throw error;
		}
	},
};

export default deletereminderCommand;
