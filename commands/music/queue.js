const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("queue")
		.setDescription("Shows the server current queue.")
		.addSubcommand((subcommand) =>
			subcommand.setName("view").setDescription("View the song queue")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("delete")
				.setDescription("Delete a song from the queue")
				.addIntegerOption((option) =>
					option
						.setName("position")
						.setDescription("Queue position to delete")
						.setRequired(true)
				)
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();
		const queuePos = interaction.options.getInteger("position");

		if (interaction.options.getSubcommand() === "view") {
			const queueSongs = queue.songs.map(
				(song, i) =>
					`${i === 0 ? "**Playing:**" : `**${i}.**`} ${song.name} (${
						song.formattedDuration
					}) - ${song.user}`
			);
			const n = queue.songs.length / 20;
			const embeds = [];

			for (let i = 0; n > i; i++) {
				const queueEmbed = new EmbedBuilder()
					.setTitle(
						`${interaction.guild.name}'s Queue (${queue.formattedDuration}) [${
							i + 1
						}/${Math.ceil(n)}]`
					)
					.setDescription(queueSongs.slice(i * 20, (i + 1) * 20).join("\n"))
					.setFooter({
						text: `Commanded by ${interaction.user.tag}`,
						iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
					});

				embeds.push(queueEmbed);
			}

			const startButton = new ButtonBuilder()
				.setCustomId("start")
				.setLabel("First")
				.setStyle(ButtonStyle.Secondary);
			const backButton = new ButtonBuilder()
				.setCustomId("back")
				.setLabel("Previous")
				.setStyle(ButtonStyle.Secondary);
			const forwardButton = new ButtonBuilder()
				.setCustomId("forward")
				.setLabel("Next")
				.setStyle(ButtonStyle.Secondary);
			const endButton = new ButtonBuilder()
				.setCustomId("end")
				.setLabel("Last")
				.setStyle(ButtonStyle.Secondary);

			let group = new ActionRowBuilder().addComponents([
				startButton.setDisabled(true),
				backButton.setDisabled(true),
				forwardButton.setDisabled(true),
				endButton.setDisabled(true),
			]);
			if (embeds.length > 1)
				group = new ActionRowBuilder().addComponents([
					startButton.setDisabled(true),
					backButton.setDisabled(true),
					forwardButton.setDisabled(false),
					endButton.setDisabled(false),
				]);

			const reply = await interaction.editReply({
				embeds: [embeds[0]],
				components: [group],
			});

			const collector = reply.createMessageComponentCollector({ time: 60000 });

			let currentPage = 0;

			collector.on("collect", async (int) => {
				if (
					!(
						int.channel.permissionsFor(int.member).has("ManageMessages") &&
						int.customId === "messageDelete"
					) &&
					int.member.id !== interaction.user.id
				)
					return await int.reply({
						content: `This button is only works for ${interaction.user.tag}`,
						ephemeral: true,
					});

				if (int.customId !== "messageDelete") await collector.resetTimer();

				if (int.customId === "start") {
					currentPage = 0;
					group = new ActionRowBuilder().addComponents([
						startButton.setDisabled(true),
						backButton.setDisabled(true),
						forwardButton.setDisabled(false),
						endButton.setDisabled(false),
					]);
					int.update({ embeds: [embeds[currentPage]], components: [group] });
				} else if (int.customId === "back") {
					--currentPage;
					if (currentPage === 0) {
						group = new ActionRowBuilder().addComponents([
							startButton.setDisabled(true),
							backButton.setDisabled(true),
							forwardButton.setDisabled(false),
							endButton.setDisabled(false),
						]);
					} else {
						group = new ActionRowBuilder().addComponents([
							startButton.setDisabled(false),
							backButton.setDisabled(false),
							forwardButton.setDisabled(false),
							endButton.setDisabled(false),
						]);
					}
					int.update({ embeds: [embeds[currentPage]], components: [group] });
				} else if (int.customId === "messageDelete") {
					await int.deferUpdate();
					await int.deleteReply().catch(() => null);
				} else if (int.customId === "forward") {
					currentPage++;
					if (currentPage === embeds.length - 1) {
						group = new ActionRowBuilder().addComponents([
							startButton.setDisabled(false),
							backButton.setDisabled(false),
							forwardButton.setDisabled(true),
							endButton.setDisabled(true),
						]);
					} else {
						group = new ActionRowBuilder().addComponents([
							startButton.setDisabled(false),
							backButton.setDisabled(false),
							forwardButton.setDisabled(false),
							endButton.setDisabled(false),
						]);
					}
					int.update({ embeds: [embeds[currentPage]], components: [group] });
				} else if (int.customId === "end") {
					currentPage = embeds.length - 1;
					group = new ActionRowBuilder().addComponents([
						startButton.setDisabled(false),
						backButton.setDisabled(false),
						forwardButton.setDisabled(true),
						endButton.setDisabled(true),
					]);
					int.update({ embeds: [embeds[currentPage]], components: [group] });
				}
			});

			collector.on("end", async (reason) => {
				if (["messageDelete", "messageDeleteBulk"].includes(reason)) return;
				return await reply.edit({
					components: [
						new ActionRowBuilder().addComponents(
							startButton.setDisabled(true),
							backButton.setDisabled(true),
							forwardButton.setDisabled(true),
							endButton.setDisabled(true)
						),
					],
				});
			});
		} else if (interaction.options.getSubcommand() === "delete") {
			if (queuePos > queue.songs.length && queuePos < queue.songs.length) {
				return await interaction.editReply({
					content: "There is no song at this position.",
				});
			}

			var removedSong = queue.songs[queuePos].name;
			queue.songs.splice(queuePos, 1);

			return await interaction.editReply({
				content: `Removed **${removedSong}** from the queue`,
			});
		}
	},
};
