module.exports = {
	name: 'stop',
	description: 'Clears the queue and disconnects the bot',

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

			const queue = player.getQueue(interaction.guildId);

			//Check if music is being played
			if (!queue || !queue.playing) {
				return await interaction.editReply({ content: 'No music is currently being played' });
			}

			queue.destroy();

			return await interaction.editReply({ content: 'Emptied queue and left VC' });

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}