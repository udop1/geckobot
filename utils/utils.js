module.exports = {
	numberWithCommas: function (number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},

	queueStatus: function (queue) {
		return `**Volume:** \`${queue.volume}%\` | **Filters:** \`${
			queue.filters.names.join(", ") || "OFF"
		}\` | **Loop:** \`${
			queue.repeatMode ? (queue.repeatMode === 2 ? "All Queue" : "This Song") : "OFF"
		}\` | **Autoplay:** \`${queue.autoplay ? "ON" : "OFF"}\``;
	},
};
