module.exports = {
	name: 'seek',
	description: 'Skips to a certain part of the song',
	options: [
		{
			name: 'minutes',
			type: '4', //INTEGER
			description: 'Minutes you want to skip to',
			required: false,
		},
		{
			name: 'seconds',
			type: '4', //INTEGER
			description: 'Seconds you want to skip to',
			required: false,
		},
	],

	async execute(interaction) {
		await interaction.deferReply();
		const { player } = require('../index.js');
		var skipMins = interaction.options.getInteger('minutes');
		var skipSecs = interaction.options.getInteger('seconds');

		try {
			//Check if user is in VC
			if (!interaction.member.voice.channel) {
				return await interaction.editReply({ content: 'You\'re not in a voice channel', ephemeral: true });
			} else if (interaction.guild.members.me.voice.channelId && interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
				return await interaction.editReply({ content: 'You\'re not in my voice channel', ephemeral: true });
			}

			const queue = player.nodes.get(interaction.guildId);

			//Check if music is being played
			if (!queue || !queue.node.isPlaying) {
				return await interaction.editReply({ content: 'No music is currently being played' });
			}

			if (!skipMins && !skipSecs) {
				return await interaction.editReply({ content: 'You need to enter minutes or seconds', ephemeral: true });
			}

			const skipTo = ((skipMins * 60) + skipSecs) * 1000; //Convert to MS

			//Check the seek time is within the song duration
			if (skipTo >= queue.currentTrack.durationMS) {
				return await interaction.editReply({ content: `You can only seek within the duration of the song (\`${queue.currentTrack.duration}\`)`, ephemeral: true });
			}

			queue.seek(skipTo); //Seeks in MS

			if (!skipMins) {
				skipMins = '0';
			} else if (!skipSecs) {
				skipSecs = '00';
			}

			return await interaction.editReply({ content: `Set position to (\`${skipMins}:${skipSecs}\`)` });

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}