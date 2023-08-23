module.exports = {
	name: "server",
	description: "Allows you to get info about the server.",
	execute(interaction) {
		interaction.reply(`This server's name is: ${interaction.guild.name}\nTotal Members: ${interaction.guild.memberCount}\nCreated at: ${interaction.guild.createdAt}`);
	},
};
