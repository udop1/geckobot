const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'lyrics',
	description: 'Gets the lyrics for the current song',

	async execute(interaction) {
		await interaction.deferReply();
		const { player, lyricsClient } = require('../index.js');

		try {
			//Check if user is in VC
			if (!interaction.member.voice.channel) {
				return await interaction.editReply({ content: 'You\'re not in a voice channel', ephemeral: true });
			} else if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
				return await interaction.editReply({ content: 'You\'re not in my voice channel', ephemeral: true });
			}

			const queue = player.getQueue(interaction.guildId);

			//Check if music is being played
			if (!queue || !queue.playing) {
				return await interaction.editReply({ content: 'No music is currently being played' });
			}

			const songLyrics = await lyricsClient.search(queue.current.title);

			if (!songLyrics) {
				return await interaction.editReply({ content: 'No lyrics found for this song' });
			}

			//Match any ([]) whitespace (\s) or non-whitespace (\S) char that is between 4096 chars ({1,4096}) and go to the end of the line ($)
			var splitArrLyrics = songLyrics.lyrics.match(/[\s\S]{1,4096}$/gm);

			//Creates embed and fills with regexed information
			var lyricsEmbed = [];
			var firstEmbed = true;
			for (var i = 0; i < splitArrLyrics.length; i++) {
				lyricsEmbed[i] = new EmbedBuilder();
				lyricsEmbed[i].setColor('#0099ff');
				lyricsEmbed[i].setTitle(`Lyrics: ${queue.current.title}`);
				lyricsEmbed[i].setFooter({ text: `Page ${i + 1}` })
				lyricsEmbed[i].setTimestamp();

				lyricsEmbed[i].setDescription(`${splitArrLyrics[i]}`);

				if (firstEmbed == true) {
					await interaction.editReply({ embeds: [lyricsEmbed[i]] });
					firstEmbed = false;
				} else {
					await interaction.followUp({ embeds: [lyricsEmbed[i]] });
				}
			}


		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}