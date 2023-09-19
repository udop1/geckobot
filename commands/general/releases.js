const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("releases")
		.setDescription("See all movie/TV release dates"),

	async execute(client, interaction) {
		await interaction.deferReply();
		const { mysql } = require("../../index");

		try {
			var getAllReleases = function () {
				let promise = new Promise(function (resolve) {
					setTimeout(function () {
						mysql.query(
							"SELECT release_name, release_date, release_date_sort FROM tbl_Releases ORDER BY release_date_sort",
							function (error, result) {
								if (error) throw error;
								resolve(result);
							}
						);
					}, 1000);
				});
				return promise;
			};
			var findReleases = await getAllReleases();

			const nthAmount = 10; //How many reminders per page (max per embed: 25)
			var releaseArrayName = findReleases.map((t) => t.release_name);
			var releaseArrayDate = findReleases.map((t) => t.release_date);

			var splitArrayName = new Array(Math.ceil(releaseArrayName.length / nthAmount))
				.fill()
				.map(() => releaseArrayName.splice(0, nthAmount));
			var splitArrayDate = new Array(Math.ceil(releaseArrayDate.length / nthAmount))
				.fill()
				.map(() => releaseArrayDate.splice(0, nthAmount));

			var embeddedReminder = [];
			var firstEmbed = true;
			if (splitArrayName.length > 0) {
				for (var i = 0; i < splitArrayName.length; i++) {
					embeddedReminder[i] = new EmbedBuilder();
					embeddedReminder[i].setColor("#0099ff");
					embeddedReminder[i].setTitle("Upcoming Releases");

					for (var j = 0; j < splitArrayName[i].length; j++) {
						embeddedReminder[i].addFields({
							name: `${splitArrayName[i][j]}`,
							value: `${splitArrayDate[i][j]}`,
							inline: false,
						});
					}
					if (firstEmbed == true) {
						await interaction.editReply({ embeds: [embeddedReminder[i]] });
						firstEmbed = false;
					} else {
						await interaction.followUp({ embeds: [embeddedReminder[i]] });
					}
				}
			} else {
				await interaction.editReply({
					content: `There are no releases coming soon.`,
				});
			}
		} catch (error) {
			return console.log(error);
		}
	},
};
