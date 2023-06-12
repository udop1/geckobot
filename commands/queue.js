const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "queue",
	description: "Song queue",
	options: [
		{
			name: "view",
			description: "View the song queue",
			type: 1, //SUBCOMMAND
		},
		{
			name: "delete",
			description: "Delete a song from the queue",
			type: 1, //SUBCOMMAND
			options: [
				{
					name: "position",
					description: "Queue position to delete",
					type: 4, //INTEGER
					required: true,
				},
			],
		},
	],

	async execute(interaction) {
		await interaction.deferReply();
		const { player } = require("../index.js");
		const queuePos = interaction.options.getInteger("position") - 1; //Arr start 0

		try {
			//Check if user is in VC
			if (!interaction.member.voice.channel) {
				return await interaction.editReply({ content: "You're not in a voice channel", ephemeral: true });
			} else if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
				return await interaction.editReply({ content: "You're not in my voice channel", ephemeral: true });
			}

			const queue = player.nodes.get(interaction.guildId);

			//Check if music is being played
			if (!queue || !queue.node.isPlaying) {
				return await interaction.editReply({ content: "No music is currently being played" });
			}

			//Check if anything is in the queue
			if (queue.tracks.data.length <= 0) {
				return await interaction.editReply({ content: "Nothing currently in the queue" });
			}

			//View command
			if (interaction.options.getSubcommand() === "view") {
				//Seperates the queue into specific blocks
				var embedLength = 25;
				var queueArrTitle = queue.tracks.map((track) => track.title);
				var queueArrAuthor = queue.tracks.map((track) => track.author);
				var queueArrRequested = queue.tracks.map((track) => track.requestedBy.username);
				var queueArrURL = queue.tracks.map((track) => track.url);

				var splitArrTitle = new Array(Math.ceil(queueArrTitle.length / embedLength)).fill().map((_) => queueArrTitle.splice(0, embedLength));
				var splitArrAuthor = new Array(Math.ceil(queueArrAuthor.length / embedLength)).fill().map((_) => queueArrAuthor.splice(0, embedLength));
				var splitArrRequested = new Array(Math.ceil(queueArrRequested.length / embedLength)).fill().map((_) => queueArrRequested.splice(0, embedLength));
				var splitArrURL = new Array(Math.ceil(queueArrURL.length / embedLength)).fill().map((_) => queueArrURL.splice(0, embedLength));

				//Creates embed and fills with split information
				var queueEmbed = [];
				var firstEmbed = true;
				for (var i = 0; i < splitArrTitle.length; i++) {
					queueEmbed[i] = new EmbedBuilder();
					queueEmbed[i].setColor("#0099ff");
					queueEmbed[i].setTitle("Queue:");
					queueEmbed[i].setFooter({ text: `Page ${i + 1}` });
					queueEmbed[i].setTimestamp();

					for (var j = 0; j < splitArrTitle[i].length; j++) {
						queueEmbed[i].addFields({ name: `Position: ${embedLength * i + j + 1}`, value: `Title: ${splitArrTitle[i][j]}\nAuthor: ${splitArrAuthor[i][j]}\nRequested By: ${splitArrRequested[i][j]}\n\u200b\nURL: ${splitArrURL[i][j]}`, inline: true });
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
			else if (interaction.options.getSubcommand() === "delete") {
				if (queuePos > queue.tracks.size && queuePos < queue.tracks.size) {
					return await interaction.editReply({ content: "There is nothing in this position in the queue" });
				}

				var removedSong = queue.tracks.data[queuePos].title;

				queue.node.remove(queuePos);

				return await interaction.editReply({ content: `Removed **${removedSong}** from the queue` });
			}
		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	},
};
