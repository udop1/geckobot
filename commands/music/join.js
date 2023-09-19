const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("join")
		.setDescription("Joins to your current Voice Channel."),
	memberVoice: true,
	botVoice: false,
	sameVoice: true,
	queueNeeded: false,

	async execute(client, interaction, memberVC, botVC) {
		await interaction.deferReply();

		if (memberVC && botVC && memberVC.id === botVC.id) {
			const inVoiceEmbed = new EmbedBuilder()
				.setDescription("I'm already connected to your Voice Channel.")
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [inVoiceEmbed] });
		}

		try {
			await client.distube.voices.join(memberVC);

			const joinEmbed = new EmbedBuilder()
				.setDescription("I've connected to your Voice Channel.")
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [joinEmbed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(
					error.message.length > 4096
						? error.message.slice(0, 4093) + "..."
						: error.message
				)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [errorEmbed] });
		}
	},
};
