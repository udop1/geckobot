function absoluteresolution(timedata) {
	let currentDate = new Date();
	let colon = 0;
	let slashcount = 0;

	for (let i = 0; i < timedata.length; i++) {
		if (timedata[i] == "/") {
			slashcount = slashcount + 1;
		}
	}

	for (let i = 0; i < timedata.length; i++) {
		if (timedata[i] == ":") {
			colon = i;
		}
	}
	var hour = timedata.slice(colon - 2, colon).join("");
	var minute = timedata.slice(colon + 1, colon + 3).join("");

	if (slashcount == 0) {
		let cDay = currentDate.getDate();
		let cMonth = String(currentDate.getMonth() + 1);
		if (cMonth.length == 1) {
			cMonth = "0" + cMonth;
		}
		let cYear = currentDate.getFullYear();
		let totalstring = `${cYear}-${cMonth}-${cDay}T${hour}:${minute}:00`;
		return Date.parse(totalstring) / 1000;
	}
	let firstslash = 0;

	if (slashcount == 1) {
		var year = currentDate.getFullYear();
	} else {
		for (let i = 0; i < timedata.length; i++) {
			if (timedata[i] == "/") {
				firstslash = i;
			}
		}
		var y = timedata.slice(firstslash + 1);
		//console.log(y);
		if (y.length >= 4) {
			//console.log(y);
			year = y.slice(0, 4).join("");
		} else {
			let x = String(timedata.slice(firstslash + 1, firstslash + 3).join(""));
			year = Math.floor(currentDate.getFullYear() / 100) + x;
		}
	}

	for (let i = 0; i < timedata.length; i++) {
		if (timedata[i] == "/") {
			firstslash = i;
			break;
		}
	}

	var day = timedata.slice(firstslash - 2, firstslash).join("");
	if (day[0] == " ") {
		day = "0" + day[1];
	}
	var month = timedata.slice(firstslash + 1, firstslash + 3).join("");

	if (month[1] == "/") {
		month = "0" + month[0];
	}
	//console.log(year);
	let totalstring = `${year}-${month}-${day}T${hour}:${minute}:00`;
	return Date.parse(totalstring) / 1000;
}

function relativeresolution(timedata) {
	var startTime = Math.trunc(new Date().getTime() / 1000);

	for (var i = 0; i < timedata.length; i++) {
		if (timedata[i] == null) {
			timedata[i] = 0;
		}
	}

	var unixdata = 0;
	for (var x = 0; x < timedata.length; x++) {
		unixdata += timedata[x];
	}

	return unixdata + startTime;
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
		var startTime = Math.trunc(new Date().getTime() / 1000);
		var channelIn = interaction.channel.id;
		var reminder = interaction.options.getString("message");

		var absolutedata =
			interaction.options.getString("time") + " " + interaction.options.getString("date");
		absolutedata = absolutedata.split("");

		var weekInput = interaction.options.getInteger("week") * 604800;
		var dayInput = interaction.options.getInteger("day") * 86400;
		var hourInput = interaction.options.getInteger("hour") * 3600;
		var minuteInput = interaction.options.getInteger("minute") * 60;
		var secondInput = interaction.options.getInteger("second");
		var relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

		var endTime, recurrenceSum;
		if (interaction.options.getSubcommand() === "absolute") {
			endTime = absoluteresolution(absolutedata);
			recurrenceSum = endTime - startTime;
		} else if (interaction.options.getSubcommand() === "relative") {
			endTime = relativeresolution(relativedata);

			var relativeSum = 0;
			for (var i = 0; i < relativedata.length; i++) {
				relativeSum += relativedata[i];
			}
			recurrenceSum = relativeSum;
		}

		var isRecurring;
		if (
			interaction.options.getBoolean("recurring") == null ||
			interaction.options.getBoolean("recurring") == false
		) {
			//If they don't enter, presume false
			isRecurring = "false";
		} else if (interaction.options.getBoolean("recurring") == true) {
			isRecurring = "true";
		}

		if (interaction.options.getBoolean("recurring") == true && endTime < startTime + 21600) {
			return await interaction.reply({
				content: "Your recurring reminder can't end before 6 hours.",
				ephemeral: true,
			});
		} else {
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

				var dateObject = new Date(endTime * 1000);
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
				var endYear = dateObject.getFullYear();
				var endMonth = endMonths[dateObject.getMonth()];
				var endDate = ("0" + dateObject.getDate()).slice(-2);
				var endHour = ("0" + dateObject.getHours()).slice(-2);
				var endMin = ("0" + dateObject.getMinutes()).slice(-2);
				var endSec = ("0" + dateObject.getSeconds()).slice(-2);

				return await interaction.editReply({
					content: `Your reminder for ${endDate} ${endMonth} ${endYear} at ${endHour}:${endMin}:${endSec} has been set!`,
				});
			} catch (error) {
				console.log(error);
				return await interaction.editReply({ content: `Error:\n\`${error}\`` });
			}
		}
	},
};
