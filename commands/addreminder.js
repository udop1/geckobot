var startTime = Math.trunc(new Date().getTime() / 1000);

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
		if(cMonth.length == 1){
			cMonth = "0" + cMonth;
		}
		let cYear = currentDate.getFullYear();
		let totalstring = (cYear + "-" + cMonth + "-" + cDay + "T" + hour + ":" + minute + ":00");
		return Date.parse(totalstring) / 1000;
	}
	let firstslash = 0;

	if (slashcount == 1) {
	  	var cYear = currentDate.getFullYear();
	} else {
	  	for (let i = 0; i < timedata.length; i++) {
			if (timedata[i] == "/") {
		  		firstslash = i;
			}
	  	}
	  	var y = (timedata.slice(firstslash+1));
	  	//console.log(y);
	  	if(y.length >= 4){
			//console.log(y);
			var year = (y.slice(0,4)).join("");
	  	} else{
			let x = String(timedata.slice(firstslash + 1, firstslash + 3).join(""));
			var year = (Math.floor(currentDate.getFullYear()/100) + x);
	  	}
	}

	for (let i = 0; i < timedata.length; i++) {
	  	if (timedata[i] == "/") {
			firstslash = i;
			break;
	  	}
	}
  
	var day = (timedata.slice(firstslash - 2, firstslash)).join("");
	if(day[0] == ' '){
	  	day = "0" + day[1];
	}
	var month = (timedata.slice(firstslash + 1, firstslash + 3)).join("");
  
	if(month[1] == '/'){
	  	month = "0" + month[0];
	}
	//console.log(year);
	let totalstring = (year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00");
	return (Date.parse(totalstring) / 1000);
}
  
function relativeresolution(timedata) {
	var startTime = Math.trunc(new Date().getTime() / 1000);

	for (var i=0; i < timedata.length; i++) {
		if (timedata[i] == null) {
			timedata[i] = 0;
		}
	}

	var unixdata = 0;
	for (var x=0; x < timedata.length; x++) {
		unixdata += timedata[x];
	}

	return (unixdata + startTime);
}

module.exports = {
    name: 'addreminder',
    description: 'Create a new reminder.',
	options: [
		{
			name: "absolute",
			description: "Use 24-hour time with DD/MM/YYYY",
			type: 1, //Sub Command
			options: [
				{
					name: "message",
					description: "Reminder message",
					type: 3, //String
					required: true,
				},
				{
					name: "time",
					description: "24-hour",
					type: 3, //String
					required: true,
				},
				{
					name: "date",
					description: "DD/MM/YYYY",
					type: 3, //String
					required: true,
				},
			],
		},
		{
			name: "relative",
			description: "Specify how long in weeks/days/hours/minutes/seconds you want your reminder to finish",
			type: 1, //Sub Command
			options: [
				{
					name: "message",
					description: "Reminder message",
					type: 3, //String
					required: true,
				},
				{
					name: "week",
					description: "Number of weeks",
					type: 4, //Integer
					required: false,
				},
				{
					name: "day",
					description: "Number of days",
					type: 4, //Integer
					required: false,
				},
				{
					name: "hour",
					description: "Number of hours",
					type: 4, //Integer
					required: false,
				},
				{
					name: "minute",
					description: "Number of minutes",
					type: 4, //Integer
					required: false,
				},
				{
					name: "second",
					description: "Number of seconds",
					type: 4, //Integer
					required: false,
				},
			],
		},
	],
    async execute(interaction, message) {
        const {mysql} = require('../index');
		var channelIn = interaction.channel.id;
		var reminder = interaction.options.getString('message');

		var absolutedata = interaction.options.getString('time') + " " + interaction.options.getString('date');
		absolutedata = absolutedata.split("");

		var weekInput = interaction.options.getInteger('week') * 604800;
		var dayInput = interaction.options.getInteger('day') * 86400;
		var hourInput = interaction.options.getInteger('hour') * 3600;
		var minuteInput = interaction.options.getInteger('minute') * 60;
		var secondInput = interaction.options.getInteger('second');
		var relativedata = [weekInput, dayInput, hourInput, minuteInput, secondInput];

		if (interaction.options.getSubcommand() === 'absolute') {
			var endTime = absoluteresolution(absolutedata);
		} else if (interaction.options.getSubcommand() === 'relative') {
			var endTime = relativeresolution(relativedata);
		}

        try {
			await interaction.reply('Your reminder is being added...');
			var message = await interaction.fetchReply();
			mysql.query("INSERT INTO tbl_Reminders (username, reminder, start_time, end_duration, channel_in, message_url) VALUES (" + mysql.escape(interaction.user.id) + ", " + mysql.escape(reminder) + ", " + mysql.escape(startTime) + ", " + mysql.escape(endTime) + ", " + mysql.escape(channelIn) + ", " + mysql.escape(message.url) + ")", function (error, result) {
				if (error) throw error;
				console.log("Reminder Added By: " + interaction.user.id);
			});

            var dateObject = new Date(endTime * 1000);
            var endMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var endYear = dateObject.getFullYear();
            var endMonth = endMonths[dateObject.getMonth()];
            var endDate = ('0' + dateObject.getDate()).substr(-2);
            var endHour = ('0' + dateObject.getHours()).substr(-2);
            var endMin = ('0' + dateObject.getMinutes()).substr(-2);
            var endSec = ('0' + dateObject.getSeconds()).substr(-2);

            return await interaction.editReply('Your reminder for ' + endDate + ' ' + endMonth + ' ' + endYear + ' at ' + endHour + ':' + endMin + ':' + endSec + ' has been set!');
        } catch (error) {
            console.log(error);
            return await interaction.reply({ content: 'Error:\n`' + error + '`', ephemeral: true });
        }
    },
};