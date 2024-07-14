module.exports = {
	name: 'finish',
	distube: true,

	async execute(queue) {
		await queue.voice.leave();
	},
};
