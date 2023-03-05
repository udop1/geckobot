const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'search',
	description: 'Search for a song',
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

			//Search results embed
			var searchEmbed = new EmbedBuilder();
			searchEmbed.setColor('#0099ff');
			searchEmbed.setTitle('Results:');
			searchEmbed.setTimestamp();

			for (var i = 0; i < 5; i++) {
				searchEmbed.addFields(
					{ name: `Result: ${i + 1}`, value: `${searchResult.tracks[i].title} (\`${searchResult.tracks[i].duration}\`)` },
				);
			}

			//Choice reactions and results
			const searchMessage = await interaction.editReply({ embeds: [searchEmbed], fetchReply: true });
			searchMessage.react('1️⃣')
				.then(() => searchMessage.react('2️⃣'))
				.then(() => searchMessage.react('3️⃣'))
				.then(() => searchMessage.react('4️⃣'))
				.then(() => searchMessage.react('5️⃣'))
				.catch(error => console.log(error));

			const filter = (reaction, user) => {
				return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && user.id === interaction.user.id;
			}

			var promises = [];
			var promise = new Promise((resolve) => {
				var searchChoice;
				searchMessage.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '1️⃣') {
						searchMessage.reactions.removeAll();
						searchChoice = 0;
						resolve(searchChoice);
					} else if (reaction.emoji.name === '2️⃣') {
						searchMessage.reactions.removeAll();
						searchChoice = 1;
						resolve(searchChoice);
					} else if (reaction.emoji.name === '3️⃣') {
						searchMessage.reactions.removeAll();
						searchChoice = 2;
						resolve(searchChoice);
					} else if (reaction.emoji.name === '4️⃣') {
						searchMessage.reactions.removeAll();
						searchChoice = 3;
						resolve(searchChoice);
					} else if (reaction.emoji.name === '5️⃣') {
						searchMessage.reactions.removeAll();
						searchChoice = 4;
						resolve(searchChoice);
					}
				}).catch(collected => {
					console.log(collected);
					return interaction.editReply({ content: 'You didn\'t select in time', embeds: [] });
				});
			});
			promises.push(promise);

			//Wait for user to choose
			Promise.all(promises).then(async (searchChoice) => {
				if (searchResult.tracks[searchChoice].durationMS >= 3600000) {
					return await interaction.editReply({ content: 'Song can\'t be longer than 1 hour' });
				}

				//If there's a playlist, add all of them. Otherwise, just add the first result
				queue.addTrack(searchResult.tracks[searchChoice]);
				if (!queue.node.isPlaying()) { //If not already playing
					await queue.node.play();
				}

				return await interaction.editReply({ content: `\:notes: Added **${searchResult.tracks[searchChoice].title}** (\`${searchResult.tracks[searchChoice].duration}\`) to the queue!`, embeds: [] });
			});
			promises = []; //Clean array

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}