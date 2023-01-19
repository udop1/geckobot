const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'queue',
	description: 'Song queue',
	options: [
		{
			name: 'view',
			description: 'View the song queue',
			type: 1, //SUBCOMMAND
		},
		{
			name: 'delete',
			description: 'Delete a song from the queue',
			type: 1, //SUBCOMMAND
			options: [
				{
					name: 'position',
					description: 'Queue position to delete',
					type: 4, //INTEGER
					required: true,
				},
			],
		},
	],

	async execute(interaction) {
		await interaction.deferReply();
		const { player } = require('../index.js');
		const queuePos = interaction.options.getInteger('position') - 1; //Arr start 0

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

			//Check if anything is in the queue
			if (!queue.tracks[0]) {
				return await interaction.editReply({ content: 'Nothing currently in the queue' });
			}


			//View command
			if (interaction.options.getSubcommand() === 'view') {
				//Seperates the queue into specific blocks
				var embedLength = 25;
				var queueArrTitle = [];
				var queueArrAuthor = [];
				var queueArrRequested = [];
				var queueArrURL = [];
				for (var i = 0; i < queue.tracks.length; i++) {
					queueArrTitle.push(queue.tracks[i].title);
					queueArrAuthor.push(queue.tracks[i].author);
					queueArrRequested.push(queue.tracks[i].requestedBy.username);
					queueArrURL.push(queue.tracks[i].url);
				}

				var splitArrTitle = new Array(Math.ceil(queueArrTitle.length / embedLength)).fill().map(_ => queueArrTitle.splice(0, embedLength));
				var splitArrAuthor = new Array(Math.ceil(queueArrAuthor.length / embedLength)).fill().map(_ => queueArrAuthor.splice(0, embedLength));
				var splitArrRequested = new Array(Math.ceil(queueArrRequested.length / embedLength)).fill().map(_ => queueArrRequested.splice(0, embedLength));
				var splitArrURL = new Array(Math.ceil(queueArrURL.length / embedLength)).fill().map(_ => queueArrURL.splice(0, embedLength));

				//Creates embed and fills with split information
				var queueEmbed = [];
				var firstEmbed = true;
				for (var i = 0; i < splitArrTitle.length; i++) {
					queueEmbed[i] = new EmbedBuilder();
					queueEmbed[i].setColor('#0099ff');
					queueEmbed[i].setTitle('Queue:');
					queueEmbed[i].setFooter({ text: `Page ${i + 1}` });
					queueEmbed[i].setTimestamp();

					for (var j = 0; j < splitArrTitle[i].length; j++) {
						queueEmbed[i].addFields(
							{ name: `Position: ${(embedLength * i) + j + 1}`, value: `Title: ${splitArrTitle[i][j]}\nAuthor: ${splitArrAuthor[i][j]}\nRequested By: ${splitArrRequested[i][j]}\n\u200b\nURL: ${splitArrURL[i][j]}`, inline: true },
						);
					}

					if (firstEmbed == true) {
						await interaction.editReply({ embeds: [queueEmbed[i]] });
						firstEmbed = false;
					} else {
						await interaction.followUp({ embeds: [queueEmbed[i]] });
					}
				}
			}

			//Delete command
			else if (interaction.options.getSubcommand() === 'delete') {
				if (queuePos > queue.tracks.length && queuePos < queue.tracks.length) {
					return await interaction.editReply({ content: 'There is nothing in this position in the queue' });
				}

				var removedSong = queue.tracks[queuePos].title;

				queue.remove(queuePos);

				return await interaction.editReply({ content: `Removed **${removedSong}** from the queue` });
			}

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}