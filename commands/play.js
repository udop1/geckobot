module.exports = {
	name: 'play',
	description: 'Plays music',
	options: [
		{
			name: 'song',
			type: '3', //STRING
			description: 'Song you want to play',
			required: true
		},
	],

	async execute(interaction) {
		await interaction.deferReply();
		const { player, QueryType } = require('../index.js');
		const playdl = require("play-dl");
		const songQuery = interaction.options.getString('song');

		try {
			//Check if user is in VC
			if (!interaction.member.voice.channel) {
				return await interaction.editReply({ content: 'You\'re not in a voice channel', ephemeral: true });
			} else if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
				return await interaction.editReply({ content: 'You\'re not in my voice channel', ephemeral: true });
			}

			//Search for user requested song
			const searchResult = await player.search(songQuery, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO
			}).catch((error) => {
				console.log(error);
			});
			if (!searchResult || !searchResult.tracks.length) {
				return await interaction.editReply({ content: `No results found for ${songQuery}`, ephemeral: true });
			} else if (searchResult.tracks[0].durationMS >= 3600000) {
				return await interaction.editReply({ content: 'Song can\'t be longer than 1 hour', ephemeral: true });
			}

			//Create queue
			var queue = player.nodes.get(interaction.guildId);
			if (!queue) {
				var queue = player.nodes.create(interaction.guild, {
					ytdlOptions: {
						quality: 'highestaudio',
						filter: 'audioonly',
					},
					metadata: {
						channel: interaction.channel
					},
					disableVolume: true,
	
					async onBeforeCreateStream(track, source, _queue) {
						if (source === "youtube") {
							return (await playdl.stream(track.url, { discordPlayerCompatibility: true })).stream;
						}
					}
				});
			}

			//Attempt VC connection
			try {
				if (!queue.connection) { //If not already connected
					await queue.connect(interaction.member.voice.channel);
				}

			} catch {
				queue.delete();
				return await interaction.editReply({ content: 'Couldn\'t join your voice channel', ephemeral: true });
			}

			//If there's a playlist, add all of them. Otherwise, just add the first result
			searchResult.playlist ? queue.addTrack(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
			if (!queue.node.isPlaying()) { //If not already playing
				await queue.node.play();
			}
			return await interaction.editReply({ content: `\:notes: Added **${searchResult.tracks[0].title}** (\`${searchResult.tracks[0].duration}\`) to the queue!` });

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}