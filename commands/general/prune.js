const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("prune")
		.setDescription("Use the prune command to remove 1 to 99 messages")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName("amount")
				.setDescription("Number of messages to remove")
				.setRequired(true)
		),

	async execute(client, interaction) {
		await interaction.deferReply({ ephemeral: true });

		const amount = interaction.options.getInteger("number");

		if (isNaN(amount)) {
			return interaction.editReply({
				content: "That doesn't seem to be a valid number.",
			});
		} else if (amount <= 1 || amount > 100) {
			return interaction.editReply({
				content: "You need to input a number between 1 and 99.",
			});
		}

		await interaction.channel.bulkDelete(amount, true).catch((error) => {
			console.error(error);
			interaction.editReply({
				content: "There was an error trying to prune messages in this channel!",
			});
		});

		return interaction.editReply({
			content: `Successfully removed \`${amount}\` messages.`,
		});
	},
};
