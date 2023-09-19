const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Allows you to get info about the server"),

	async execute(client, interaction) {
		await interaction.deferReply();
		await interaction.editReply({
			content: `This server's name is: ${interaction.guild.name}\nTotal Members: ${interaction.guild.memberCount}\nCreated at: ${interaction.guild.createdAt}`,
		});
	},
};
