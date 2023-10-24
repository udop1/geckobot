function absoluteresolution(options) {
	const timedata = options.getString("time");
	const datedata = options.getString("date");
	const currentDate = new Date();
	const now = new Date(currentDate.getTime());
  
	const timeRegex = /(\d{1,2}):(\d{2})/; //Matches 1 or 2 digits, before and after a colon.
	const dateRegex = /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/; //Matches 1 or 2 digits before a /, then 1/2 digits after the /, then 2-4 digits at the end
  
	let hour = '00';
	let minute = '00';
	
	const timeMatch = timedata.match(timeRegex);
	if (timeMatch) {
	  hour = timeMatch[1].padStart(2, '0');
	  minute = timeMatch[2];
	}
  
	const dateMatch = datedata.match(dateRegex);
	if (dateMatch) {
	  let [_, day, month, year] = dateMatch.map(Number);
  
	  if (!year) {
		year = now.getFullYear();
	  } else if (year < 100) {
		year += 2000; // Assume years less than 100 refer to the 21st century
	  }
  
	  const totalString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour}:${minute}:00`;
  
	  return Date.parse(totalString) / 1000;
	}
  
	const cDay = now.getDate();
	const cMonth = (now.getMonth() + 1).toString().padStart(2, '0');
	const cYear = now.getFullYear();
	const totalString = `${cYear}-${cMonth}-${cDay}T${hour}:${minute}:00`;
  
	return Date.parse(totalString) / 1000;
  }

function relativeresolution(timedata) {
	const weekInput = timedata.getInteger("week") * 604800;
	const dayInput =  timedata.getInteger("day") * 86400;
	const hourInput = timedata.getInteger("hour") * 3600;
	const minuteInput = timedata.getInteger("minute") * 60;
	const secondInput = timedata.getInteger("second");
	const relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

	var startTime = Math.trunc(new Date().getTime() / 1000);

	for (var i = 0; i < relativedata.length; i++) {
		if (relativedata[i] == null) {
			relativedata[i] = 0;
		}
	}

	var unixdata = 0;
	for (var x = 0; x < timedata.length; x++) {
		unixdata += timedata[x];
	}

	return unixdata + startTime;
}

function getRecurranceSum(timedata){
	const weekInput = timedata.getInteger("week") * 604800;
	const dayInput =  timedata.getInteger("day") * 86400;
	const hourInput = timedata.getInteger("hour") * 3600;
	const minuteInput = timedata.getInteger("minute") * 60;
	const secondInput = timedata.getInteger("second");
	const relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

	var relativeSum = 0;
			for (var i = 0; i < relativedata.length; i++) {
				relativeSum += relativedata[i];
			}
	return relativeSum
}

function generateMessage(endTime){
	const dateObject = new Date(endTime * 1000);
	var endMonths = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const endYear = dateObject.getFullYear();
	const endMonth = endMonths[dateObject.getMonth()];
	const endDate = ("0" + dateObject.getDate()).slice(-2);
	const endHour = ("0" + dateObject.getHours()).slice(-2);
	const endMin = ("0" + dateObject.getMinutes()).slice(-2);
	const endSec = ("0" + dateObject.getSeconds()).slice(-2);
	return `Your reminder for ${endDate} ${endMonth} ${endYear} at ${endHour}:${endMin}:${endSec} has been set!`;
}

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("addreminder")
		.setDescription("Create a new reminder")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("absolute")
				.setDescription("Use 24-hour time with DD/MM/YYYY")
				.addStringOption((option) =>
					option.setName("message").setDescription("Reminder message").setRequired(true)
				)
				.addStringOption((option) =>
					option.setName("time").setDescription("24-hour").setRequired(true)
				)
				.addStringOption((option) =>
					option.setName("date").setDescription("DD/MM/YYYY").setRequired(true)
				)
				.addBooleanOption((option) =>
					option
						.setName("recurring")
						.setDescription("Should it repeat?")
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("relative")
				.setDescription(
					"Specify how long in weeks/days/hours/minutes/seconds you want your reminder to finish"
				)
				.addStringOption((option) =>
					option.setName("message").setDescription("Reminder message").setRequired(true)
				)
				.addIntegerOption((option) =>
					option.setName("week").setDescription("Number of weeks").setRequired(false)
				)
				.addIntegerOption((option) =>
					option.setName("day").setDescription("Number of days").setRequired(false)
				)
				.addIntegerOption((option) =>
					option.setName("hour").setDescription("Number of hours").setRequired(false)
				)
				.addIntegerOption((option) =>
					option.setName("minute").setDescription("Number of minutes").setRequired(false)
				)
				.addIntegerOption((option) =>
					option.setName("second").setDescription("Number of seconds").setRequired(false)
				)
				.addBooleanOption((option) =>
					option
						.setName("recurring")
						.setDescription("Should it repeat?")
						.setRequired(false)
				)
		),

	async execute(client, interaction) {
		const { mysql } = require("../../index");
		const startTime = Math.trunc(new Date().getTime() / 1000);
		const channelIn = interaction.channel.id;
		const reminder = interaction.options.getString("message");

		var endTime, recurrenceSum;
		if (interaction.options.getSubcommand() === "absolute") {
			endTime = absoluteresolution(interaction.options);
			recurrenceSum = endTime - startTime;
		} else if (interaction.options.getSubcommand() === "relative") {
			endTime = relativeresolution(interaction.options);
			recurrenceSum = getRecurranceSum(interaction.options);
		}

		const isRecurring = interaction.options.getBoolean("recurring") ? "true" : "false";

		if (interaction.options.getBoolean("recurring") == true && endTime < startTime + 21600) {
			return await interaction.reply({
				content: "Your recurring reminder can't end before 6 hours.",
				ephemeral: true,
			});
		} 

		try {
			await interaction.reply({ content: "Your reminder is being added..." });
			var message = await interaction.fetchReply();
			mysql.query(
				`INSERT INTO tbl_Reminders (username, reminder, start_time, recurrence_time, end_duration, channel_in, message_url, is_recurring) VALUES (${mysql.escape(
					interaction.user.id
				)}, ${mysql.escape(reminder)}, ${mysql.escape(startTime)}, ${mysql.escape(
					recurrenceSum
				)}, ${mysql.escape(endTime)}, ${mysql.escape(channelIn)}, ${mysql.escape(
					message.url
				)}, ${mysql.escape(isRecurring)})`,
				function (error) {
					if (error) throw error;
					console.log(`Reminder Added By: ${interaction.user.id}`);
				}
			);
			return await interaction.editReply({
				content: generateMessage(endTime),
			});
		} catch (error) {
			console.log(error);
			return await interaction.editReply({ content: `Error:\n\`${error}\`` });
		}
		
	},
};
