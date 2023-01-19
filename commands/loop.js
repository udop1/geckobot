module.exports = {
	name: 'loop',
	description: 'Loops the current song',
	options: [
		{
			name: 'looping',
			description: 'Enable or disable looping',
			type: '5', //BOOLEAN
			required: true,
		},
	],

	async execute(interaction) {
		await interaction.deferReply();
		const { player, QueueRepeatMode } = require('../index.js');
		const loopChoice = interaction.options.getBoolean('looping');

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

			if (loopChoice == true) {
				queue.setRepeatMode(QueueRepeatMode.TRACK);
				return await interaction.editReply({ content: `Looping has been \`ENABLED\`` });
			} else if (loopChoice == false) {
				queue.setRepeatMode(QueueRepeatMode.OFF);
				return await interaction.editReply({ content: `Looping has been \`DISABLED\`` });
			} else {
				console.log(loopChoice);
				console.log(error);
			}

		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `${error}` });
		}
	}
}