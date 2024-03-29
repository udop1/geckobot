const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const progressBar = require("string-progressbar");
const func = require("../../utils/utils");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nowplaying")
		.setDescription("Shows the current playing song."),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		const voiceChannelMembers = botVC.members.filter((member) => !member.user.bot);

		var dateObj = new Date(queue.currentTime * 1000);
		var minutes = dateObj.getUTCMinutes().toString().padStart(2, "0");
		var seconds = dateObj.getSeconds().toString().padStart(2, "0");
		var currentTimeFormatted = `${minutes}:${seconds}`;

		const nowEmbed = new EmbedBuilder()
			.setDescription(
				`Now playing **[${queue.songs[0].name} (${queue.songs[0].formattedDuration})](${
					queue.songs[0].url
				})** for ${voiceChannelMembers.size} ${
					voiceChannelMembers.size > 1 ? "listeners" : "listener"
				} in ${botVC}\n\n${func.queueStatus(queue)}`
			)
			.setThumbnail(queue.songs[0]?.thumbnail)
			.addFields({
				name: "\u200b",
				value: `${currentTimeFormatted} | ${
					progressBar.splitBar(queue.songs[0].duration, queue.currentTime, 15)[0]
				} | ${queue.songs[0].formattedDuration}`,
			})
			.setFooter({
				text: `Song requested by ${queue.songs[0].user.tag}`,
				iconURL: queue.songs[0].user.displayAvatarURL({ size: 1024 }),
			});

		if (queue.songs[0].views)
			nowEmbed.addFields({
				name: "👀 Views:",
				value: `${func.numberWithCommas(queue.songs[0].views)}`,
				inline: true,
			});

		if (queue.songs[0].likes)
			nowEmbed.addFields({
				name: "👍🏻 Likes:",
				value: `${func.numberWithCommas(queue.songs[0].likes)}`,
				inline: true,
			});

		if (queue.songs[0].dislikes)
			nowEmbed.addFields({
				name: "👎🏻 Dislikes:",
				value: `${func.numberWithCommas(queue.songs[0].dislikes)}`,
				inline: true,
			});

		return await interaction.editReply({ embeds: [nowEmbed] });
	},
};
