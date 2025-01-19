import {
	EmbedBuilder,
	StringSelectMenuBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	VoiceChannel,
	SelectMenuComponentOptionData,
	StringSelectMenuInteraction,
	GuildMember,
	MessageFlags,
} from 'discord.js';
import { Events, Queue, RepeatMode, Song } from 'distube';
import { EventExport } from 'types/EventTypes';
import { numberWithCommas, queueStatus } from 'utils/utils';

const distubePlaySongEvent: EventExport = {
	name: Events.PLAY_SONG,
	distube: true,

	async execute(queue: Queue, song: Song) {
		const voiceChannel = queue.distube.client.channels.cache.get(
			queue.voice.channelId,
		) as VoiceChannel;
		const voiceChannelMembers = voiceChannel.members.filter((member) => !member.user.bot);

		const embed = new EmbedBuilder()
			.setDescription(
				`Now Playing **[${song.name} (${song.formattedDuration})](${song.url})** for ${
					voiceChannelMembers.size
				} ${voiceChannelMembers.size > 1 ? 'listeners' : 'listener'} in ${voiceChannel}`,
			)
			.setThumbnail(song?.thumbnail)
			.setFooter({
				text: `Requested by ${song.user.tag}`,
				iconURL: song.user.displayAvatarURL({ size: 1024 }),
			});

		if (song.views) {
			embed.addFields({
				name: '👀 Views:',
				value: `${numberWithCommas(song.views)}`,
				inline: true,
			});
		}
		if (song.likes) {
			embed.addFields({
				name: '👍🏻 Likes:',
				value: `${numberWithCommas(song.likes)}`,
				inline: true,
			});
		}
		if (song.dislikes) {
			embed.addFields({
				name: '👎🏻 Dislikes:',
				value: `${numberWithCommas(song.dislikes)}`,
				inline: true,
			});
		}

		const filters = new StringSelectMenuBuilder()
			.setCustomId('filters')
			.setPlaceholder('Select Filters');
		const loopSongToggle = new ButtonBuilder()
			.setCustomId('loop-song')
			.setEmoji('🔂')
			.setStyle(ButtonStyle.Secondary);
		const previousSong = new ButtonBuilder()
			.setCustomId('previous')
			.setEmoji('⏮️')
			.setStyle(ButtonStyle.Secondary);
		const pauseUnpause = new ButtonBuilder()
			.setCustomId('pauseUnpause')
			.setEmoji('⏯️')
			.setStyle(ButtonStyle.Secondary);
		const nextSong = new ButtonBuilder()
			.setCustomId('next')
			.setEmoji('⏭️')
			.setStyle(ButtonStyle.Secondary);
		const loopQueueToggle = new ButtonBuilder()
			.setCustomId('loop-queue')
			.setEmoji('🔁')
			.setStyle(ButtonStyle.Secondary);
		const volumeDown = new ButtonBuilder()
			.setCustomId('vol-down')
			.setEmoji('🔉')
			.setStyle(ButtonStyle.Secondary);
		const backward = new ButtonBuilder()
			.setCustomId('backward')
			.setEmoji('⏪')
			.setStyle(ButtonStyle.Secondary);
		const stop = new ButtonBuilder()
			.setCustomId('stop')
			.setEmoji('⏹️')
			.setStyle(ButtonStyle.Secondary);
		const forward = new ButtonBuilder()
			.setCustomId('forward')
			.setEmoji('⏩')
			.setStyle(ButtonStyle.Secondary);
		const volumeUp = new ButtonBuilder()
			.setCustomId('vol-up')
			.setEmoji('🔊')
			.setStyle(ButtonStyle.Secondary);

		const options: Array<SelectMenuComponentOptionData> = [];

		for (const filter of Object.keys(queue.distube.filters)) {
			options.push({
				label: filter.charAt(0).toUpperCase() + filter.slice(1),
				value: filter,
			});
		}

		filters.addOptions(options);

		const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents([filters]);
		const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
			loopSongToggle,
			previousSong,
			pauseUnpause,
			nextSong,
			loopQueueToggle,
		]);
		const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents([
			volumeDown,
			backward,
			stop,
			forward,
			volumeUp,
		]);

		const reply = await queue.textChannel?.send({
			embeds: [embed],
			components: [row1, row2, row3],
		});

		const collector = reply.createMessageComponentCollector({
			time: song.duration * 1000,
		});

		collector.on('collect', async (int: StringSelectMenuInteraction) => {
			const memberVC = (int.member as GuildMember).voice.channel || null;
			const botVC = int.guild.members.me.voice.channel || null;

			if (memberVC && botVC && memberVC.id !== botVC.id) {
				const inVoiceEmbed = new EmbedBuilder().setDescription(
					"You aren't connected to my voice channel.",
				);

				return await int.reply({
					embeds: [inVoiceEmbed],
					flags: MessageFlags.Ephemeral,
				});
			}

			await int.deferReply();

			try {
				if (int.customId === 'filters') {
					if (queue.filters.has(int.values[0])) {
						queue.filters.remove(int.values[0]);
					} else {
						queue.filters.add(int.values[0]);
					}

					await reply.edit({
						components: [row1, row2, row3],
					});

					const filtersEmbed = new EmbedBuilder()
						.setDescription(
							`**Current Queue Filters:** \`${
								queue.filters.names.join(', ') || 'OFF'
							}\`\n\n${queueStatus(queue)}`,
						)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [filtersEmbed] });
				} else if (int.customId.startsWith('loop')) {
					const loopState = int.customId.split('-')[1];
					const currentLoopState = queue.repeatMode;
					const convertedLoopStates = {
						0: 'off',
						1: 'song',
						2: 'queue',
					};

					let mode: RepeatMode = 0;

					if (
						convertedLoopStates[currentLoopState] === 'off' ||
						loopState !== convertedLoopStates[currentLoopState]
					) {
						if (loopState === 'song') mode = 1;
						else if (loopState === 'queue') mode = 2;
					}

					mode = queue.setRepeatMode(mode);
					// mode = mode
					// 	? mode === 2
					// 		? RepeatMode.QUEUE
					// 		: RepeatMode.SONG
					// 	: RepeatMode.DISABLED;
					if (mode) {
						if (mode === 2) {
							mode = RepeatMode.QUEUE;
						} else {
							mode = RepeatMode.SONG;
						}
					} else {
						mode = RepeatMode.DISABLED;
					}

					const loopEmbed = new EmbedBuilder()
						.setDescription(`Loop mode changed to \`${mode}\`\n\n${queueStatus(queue)}`)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [loopEmbed] });
				} else if (int.customId === 'previous') {
					await queue.previous();

					const skippedEmbed = new EmbedBuilder()
						.setDescription('Skipping to the previous song.')
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					await int.editReply({ embeds: [skippedEmbed] });

					return collector.stop();
				} else if (int.customId === 'pauseUnpause') {
					if (queue.playing) {
						queue.pause();
					} else {
						queue.resume();
					}

					const pauseUnpauseEmbed = new EmbedBuilder()
						.setDescription(`${queue.playing ? 'Resumed' : 'Paused'} the song for you.`)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [pauseUnpauseEmbed] });
				} else if (int.customId === 'next') {
					await queue.skip();

					const skippedEmbed = new EmbedBuilder()
						.setDescription('Skipping to the next song.')
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					await int.editReply({ embeds: [skippedEmbed] });

					return collector.stop();
				} else if (int.customId.startsWith('vol')) {
					const volumeUpDown = int.customId.split('-')[1];

					if (volumeUpDown === 'up') await queue.setVolume(queue.volume + 10);
					else if (volumeUpDown === 'down') await queue.setVolume(queue.volume - 10);

					const volumeEmbed = new EmbedBuilder()
						.setDescription(
							`Volume changed to \`${queue.volume}\`\n\n${queueStatus(queue)}`,
						)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [volumeEmbed] });
				} else if (int.customId === 'backward') {
					await queue.seek(queue.currentTime - 10);

					const seekEmbed = new EmbedBuilder()
						.setDescription(`Rewound the song 10 seconds.`)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [seekEmbed] });
				} else if (int.customId === 'stop') {
					await queue.stop();
					queue.voice.leave();

					const stopEmbed = new EmbedBuilder()
						.setDescription('Stopped playing.')
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					await int.editReply({ embeds: [stopEmbed] });

					return collector.stop();
				} else if (int.customId === 'forward') {
					queue.seek(queue.currentTime + 10);

					const seekEmbed = new EmbedBuilder()
						.setDescription(`Fast-Forwarded the song 10 seconds.`)
						.setFooter({
							text: `Commanded by ${int.user.tag}`,
							iconURL: int.user.displayAvatarURL({ size: 1024 }),
						});

					return await int.editReply({ embeds: [seekEmbed] });
				}
			} catch (error) {
				const errorEmbed = new EmbedBuilder()
					.setDescription(
						error.message.length > 4096
							? error.message.slice(0, 4093) + '...'
							: error.message,
					)
					.setFooter({
						text: `Commanded by ${int.user.tag}`,
						iconURL: int.user.displayAvatarURL({ size: 1024 }),
					});

				return await int.editReply({ embeds: [errorEmbed] });
			}
		});

		collector.on('end', async (reason: string) => {
			if (['messageDelete', 'messageDeleteBulk'].includes(reason)) return;
			await reply.edit({ components: [] }).catch(() => null);
		});
	},
};

export default distubePlaySongEvent;
