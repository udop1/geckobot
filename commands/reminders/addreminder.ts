const absoluteResolution = (
	options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
) => {
	const timedata = options.getString('time');
	const datedata = options.getString('date');
	const currentDate = new Date();
	const now = new Date(currentDate.getTime());

	const timeRegex = /(\d{1,2}):(\d{2})/; //Matches 1 or 2 digits, before and after a colon.
	const dateRegex = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/; //Matches 1 or 2 digits before a /, then 1/2 digits after the /, then 2-4 digits at the end

	let hour = '00';
	let minute = '00';

	const timeMatch = RegExp(timeRegex).exec(timedata);
	if (timeMatch) {
		hour = timeMatch[1].padStart(2, '0');
		minute = timeMatch[2];
	}

	const dateMatch = RegExp(dateRegex).exec(datedata);
	if (dateMatch) {
		let [, day, month, year] = dateMatch.map(Number);

		if (!year) {
			year = now.getFullYear();
		} else if (year < 100) {
			year += 2000; // Assume years less than 100 refer to the 21st century
		}

		const totalString = `${year}-${month.toString().padStart(2, '0')}-${day
			.toString()
			.padStart(2, '0')}T${hour}:${minute}:00`;

		return Date.parse(totalString) / 1000;
	}

	const cDay = now.getDate();
	const cMonth = (now.getMonth() + 1).toString().padStart(2, '0');
	const cYear = now.getFullYear();
	const totalString = `${cYear}-${cMonth}-${cDay}T${hour}:${minute}:00`;

	return Date.parse(totalString) / 1000;
};

function relativeResolution(
	timedata: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
) {
	const weekInput = timedata.getInteger('week') * 604800;
	const dayInput = timedata.getInteger('day') * 86400;
	const hourInput = timedata.getInteger('hour') * 3600;
	const minuteInput = timedata.getInteger('minute') * 60;
	const secondInput = timedata.getInteger('second');
	const relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

	const startTime = Math.trunc(new Date().getTime() / 1000);

	for (let i = 0; i < relativedata.length; i++) {
		if (relativedata[i] == null) {
			relativedata[i] = 0;
		}
	}

	let unixdata = 0;
	for (const data of relativedata) {
		if (data != null) {
			unixdata += data;
		}
	}

	return unixdata + startTime;
}

function getRecurrenceSum(
	timedata: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>,
) {
	const weekInput = timedata.getInteger('week') * 604800;
	const dayInput = timedata.getInteger('day') * 86400;
	const hourInput = timedata.getInteger('hour') * 3600;
	const minuteInput = timedata.getInteger('minute') * 60;
	const secondInput = timedata.getInteger('second');
	const relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

	let relativeSum = 0;
	for (const data of relativedata) {
		relativeSum += data;
	}
	return relativeSum;
}

function generateMessage(endTime: number) {
	const dateObject = new Date(endTime * 1000);
	const endMonths = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];
	const endYear = dateObject.getFullYear();
	const endMonth = endMonths[dateObject.getMonth()];
	const endDate = ('0' + dateObject.getDate()).slice(-2);
	const endHour = ('0' + dateObject.getHours()).slice(-2);
	const endMin = ('0' + dateObject.getMinutes()).slice(-2);
	const endSec = ('0' + dateObject.getSeconds()).slice(-2);
	return `Your reminder for ${endDate} ${endMonth} ${endYear} at ${endHour}:${endMin}:${endSec} has been set!`;
}

import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	CommandInteractionOptionResolver,
	CacheType,
} from 'discord.js';
import { mysqlConnection } from 'index';
import { CommandExport } from 'types/CommandTypes';

const addreminderCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('addreminder')
		.setDescription('Create a new reminder')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('absolute')
				.setDescription('Use 24-hour time with DD/MM/YYYY')
				.addStringOption((option) =>
					option.setName('message').setDescription('Reminder message').setRequired(true),
				)
				.addStringOption((option) =>
					option.setName('time').setDescription('24-hour').setRequired(true),
				)
				.addStringOption((option) =>
					option.setName('date').setDescription('DD/MM/YYYY').setRequired(true),
				)
				.addBooleanOption((option) =>
					option
						.setName('recurring')
						.setDescription('Should it repeat?')
						.setRequired(false),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('relative')
				.setDescription(
					'Specify how long in weeks/days/hours/minutes/seconds you want your reminder to finish',
				)
				.addStringOption((option) =>
					option.setName('message').setDescription('Reminder message').setRequired(true),
				)
				.addIntegerOption((option) =>
					option.setName('week').setDescription('Number of weeks').setRequired(false),
				)
				.addIntegerOption((option) =>
					option.setName('day').setDescription('Number of days').setRequired(false),
				)
				.addIntegerOption((option) =>
					option.setName('hour').setDescription('Number of hours').setRequired(false),
				)
				.addIntegerOption((option) =>
					option.setName('minute').setDescription('Number of minutes').setRequired(false),
				)
				.addIntegerOption((option) =>
					option.setName('second').setDescription('Number of seconds').setRequired(false),
				)
				.addBooleanOption((option) =>
					option
						.setName('recurring')
						.setDescription('Should it repeat?')
						.setRequired(false),
				),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const startTime = Math.trunc(new Date().getTime() / 1000);
		const channelIn = interaction.channel.id;
		const reminder = interaction.options.getString('message');

		let endTime: number, recurrenceSum: number;
		if (interaction.options.getSubcommand() === 'absolute') {
			endTime = absoluteResolution(interaction.options);
			recurrenceSum = endTime - startTime;
		} else if (interaction.options.getSubcommand() === 'relative') {
			endTime = relativeResolution(interaction.options);
			recurrenceSum = getRecurrenceSum(interaction.options);
		}

		const isRecurring = interaction.options.getBoolean('recurring') ? 'true' : 'false';

		if (interaction.options.getBoolean('recurring') && endTime < startTime + 21600) {
			return await interaction.reply({
				content: "Your recurring reminder can't end before 6 hours.",
				ephemeral: true,
			});
		}

		try {
			await interaction.reply({ content: 'Your reminder is being added...' });
			const message = await interaction.fetchReply();
			const insertQuery = `INSERT INTO tbl_Reminders (username, reminder, start_time, recurrence_time, end_duration, channel_in, message_url, is_recurring)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
			const insertValues = [
				interaction.user.id,
				reminder,
				startTime,
				recurrenceSum,
				endTime,
				channelIn,
				message.url,
				isRecurring,
			];

			await (await mysqlConnection).query(insertQuery, insertValues);

			return await interaction.editReply({
				content: generateMessage(endTime),
			});
		} catch (error) {
			console.log(`Error inserting reminders: ${error}`);
			await interaction.editReply({ content: `Error:\n\`${error}\`` });
			throw error;
		}
	},
};

export default addreminderCommand;
