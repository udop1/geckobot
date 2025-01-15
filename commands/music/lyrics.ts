import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { Client } from 'genius-lyrics';
import { CommandExport } from 'types/CommandTypes.js';
const geniusClient = new Client();

const lyricsCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription("Shows the current playing song's lyrics."),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		const searches = await geniusClient.songs.search(queue.songs[0].name);

		if (!searches || searches.length === 0) {
			return await interaction.editReply({ content: 'No lyrics found for this song' });
		}

		const lyrics = await searches[0].lyrics();

		if (!lyrics) {
			return await interaction.editReply({ content: 'No lyrics found for this song' });
		}

		const splitArrLyrics = lyrics.match(/[\s\S]{1,4096}$/gm);
		const lyricsEmbed: Array<EmbedBuilder> = [];
		let firstEmbed = true;

		for (let i = 0; i < splitArrLyrics.length; i++) {
			lyricsEmbed[i] = new EmbedBuilder();
			lyricsEmbed[i].setTitle(`Lyrics: ${queue.songs[0].name}`);
			lyricsEmbed[i].setFooter({ text: `Page ${i + 1}` });
			lyricsEmbed[i].setTimestamp();
			lyricsEmbed[i].setDescription(`${splitArrLyrics[i]}`);

			if (firstEmbed) {
				await interaction.editReply({ embeds: [lyricsEmbed[i]] });
				firstEmbed = false;
			} else {
				await interaction.followUp({ embeds: [lyricsEmbed[i]] });
			}
		}
	},
};

export default lyricsCommand;
