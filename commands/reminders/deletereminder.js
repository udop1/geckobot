const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("deletereminder")
		.setDescription("Delete a created reminder")
		.addIntegerOption((option) =>
			option.setName("id").setDescription("Reminder ID").setRequired(true)
		),

	async execute(client, interaction) {
		await interaction.deferReply();

		const { mysql } = require("../../index");
		const messageOwner = interaction.user.id;
		const reminderID = interaction.options.getInteger("id");

		mysql.query(
			`DELETE FROM tbl_Reminders WHERE reminder_id = ${mysql.escape(
				reminderID
			)} AND username = ${mysql.escape(messageOwner)}`,
			function (error, result) {
				if (error) throw error;
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
			}
		);
	},
};
