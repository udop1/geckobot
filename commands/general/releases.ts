import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { mysqlConnection } from 'index';
import { AllReleases, CommandExport } from 'types/CommandTypes';

const releasesCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('releases')
		.setDescription('See all movie/TV release dates'),

	async execute(...args: any) {
		const interaction: ChatInputCommandInteraction = args.find(
			(item: any): item is ChatInputCommandInteraction => {
				return item instanceof ChatInputCommandInteraction;
			},
		);
		await interaction.deferReply();

		try {
			const getAllReleases = async () => {
				try {
					const getReleasesQuery = `SELECT release_name, release_date, release_date_sort
					FROM tbl_Releases
					ORDER BY release_date_sort`;

					const [result] = await (await mysqlConnection).query(getReleasesQuery);

					return result;
				} catch (error) {
					console.error(`Error fetching all releases: ${error}`);

					throw error;
				}
			};

			const findReleases: Array<AllReleases> = await getAllReleases();

			const nthAmount = 10; //How many reminders per page (max per embed: 25)
			const releaseArrayName = findReleases.map((t: any) => t.release_name);
			const releaseArrayDate = findReleases.map((t: any) => t.release_date);

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
