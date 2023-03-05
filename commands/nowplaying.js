module.exports = {
	name: 'nowplaying',
	description: 'Current playing song',

	async execute(interaction) {
		await interaction.deferReply();
		const { player } = require('../index.js');

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

			const progress = queue.node.createProgressBar();

			return await interaction.editReply({
				embeds: [
					{
						title: 'Now Playing:',
						description: `**${queue.currentTrack.title}**\nRequested By: ${queue.currentTrack.requestedBy}`,
						fields: [
							{
								name: 'Link:',
								value: queue.currentTrack.url,
							},
							{
								name: '\u200b',
								value: progress,
							},
						],

						color: 0x0099ff,
					},
				],
			});

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}