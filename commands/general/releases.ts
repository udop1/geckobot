import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Connection } from 'mysql2/promise';
import { CommandExport } from 'types/CommandTypes';

const releasesCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('releases')
		.setDescription('See all movie/TV release dates'),

	async execute(interaction: ChatInputCommandInteraction, mysql: Connection) {
		await interaction.deferReply();

		try {
			// const getAllReleases = () => {
			// 	let promise = new Promise(function (resolve) {
			// 		setTimeout(function () {
			// 			mysql.query(
			// 				'SELECT release_name, release_date, release_date_sort FROM tbl_Releases ORDER BY release_date_sort',
			// 				function (error, result) {
			// 					if (error) throw error;
			// 					resolve(result);
			// 				}
			// 			);
			// 		}, 1000);
			// 	});
			// 	return promise;
			// };
			const getAllReleases = async () => {
				try {
					const getReleasesQuery = `SELECT release_name, release_date, release_date_sort
					FROM tbl_Releases
					ORDER BY release_date_sort`;

					const [result] = await mysql.query(getReleasesQuery);

					return result[0];
				} catch (error) {
					console.error(`Error fetching all releases: ${error}`);

					throw error;
				}
			};

			const findReleases = await getAllReleases();

			const nthAmount = 10; //How many reminders per page (max per embed: 25)
			const releaseArrayName = findReleases.map((t: any) => t.release_name);
			const releaseArrayDate = findReleases.map((t: any) => t.release_date);

			// const splitArrayName = new Array(Math.ceil(releaseArrayName.length / nthAmount))
			// 	.fill()
			// 	.map(() => releaseArrayName.splice(0, nthAmount));
			// const splitArrayDate = new Array(Math.ceil(releaseArrayDate.length / nthAmount))
			// 	.fill()
			// 	.map(() => releaseArrayDate.splice(0, nthAmount));
			const splitArrayName = Array.from(
				{ length: Math.ceil(releaseArrayName.length / nthAmount) },
				() => releaseArrayName.splice(0, nthAmount),
			);
			const splitArrayDate = Array.from(
				{ length: Math.ceil(releaseArrayDate.length / nthAmount) },
				() => releaseArrayDate.splice(0, nthAmount),
			);

			let embeddedReminder = [];
			let firstEmbed = true;
			if (splitArrayName.length > 0) {
				for (let i = 0; i < splitArrayName.length; i++) {
					embeddedReminder[i] = new EmbedBuilder();
					embeddedReminder[i].setColor('#0099ff');
					embeddedReminder[i].setTitle('Upcoming Releases');

					for (let j = 0; j < splitArrayName[i].length; j++) {
						embeddedReminder[i].addFields({
							name: `${splitArrayName[i][j]}`,
							value: `${splitArrayDate[i][j]}`,
							inline: false,
						});
					}
					if (firstEmbed) {
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

export default releasesCommand;