const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Genius = require("genius-lyrics");
const geniusClient = new Genius.Client();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lyrics")
		.setDescription("Shows the current playing song's lyrics."),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		const searches = await geniusClient.songs.search(queue.songs[0].name);

		if (!searches || searches.length === 0) {
			return await interaction.editReply({ content: "No lyrics found for this song" });
		}

		const lyrics = await searches[0].lyrics();

		if (!lyrics) {
			return await interaction.editReply({ content: "No lyrics found for this song" });
		}

		var splitArrLyrics = lyrics.match(/[\s\S]{1,4096}$/gm);

		var lyricsEmbed = [];
		var firstEmbed = true;
		for (var i = 0; i < splitArrLyrics.length; i++) {
			lyricsEmbed[i] = new EmbedBuilder();
			lyricsEmbed[i].setTitle(`Lyrics: ${queue.songs[0].name}`);
			lyricsEmbed[i].setFooter({ text: `Page ${i + 1}` });
			lyricsEmbed[i].setTimestamp();
			lyricsEmbed[i].setDescription(`${splitArrLyrics[i]}`);

			if (firstEmbed == true) {
				await interaction.editReply({ embeds: [lyricsEmbed[i]] });
				firstEmbed = false;
			} else {
				await interaction.followUp({ embeds: [lyricsEmbed[i]] });
			}
		}
	},
};
