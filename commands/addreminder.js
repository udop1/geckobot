const { prefix } = require('../config.json');

var inputstring = "!addreminder 23:47 13/06/2021@reminder"

function conversionvalue(key) {
    if (key == "s") {
        return 1
    } else if (key == "m") {
        return 60
    } else if (key == "h") {
        return 3600
    } else if (key == "d") {
        return 86400
    } else if (key == "w") {
        return 604800
    } else {
        return 0
    }
}


function absoluteresolution(timedata) {
    let currentDate = new Date();
    let colon = 0;
    let slashcount = 0


    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == "/") {
            slashcount = slashcount + 1
        }
    }


    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == ":") {
            colon = i
        }
    }
    var hour = timedata.slice(colon - 2, colon).join("")
    var minute = timedata.slice(colon + 1, colon + 3).join("")


    if (slashcount == 0) {
        let cDay = currentDate.getDate()
        let cMonth = String(currentDate.getMonth() + 1)
        if (cMonth.length == 1) {
            cMonth = "0" + cMonth
        }
        let cYear = currentDate.getFullYear()
        let totalstring = (cYear + "-" + cMonth + "-" + cDay + "T" + hour + ":" + minute + ":00")
        return Date.parse(totalstring) / 1000
    }
    let firstslash = 0


    if (slashcount == 1) {
        var cYear = currentDate.getFullYear()
    } else {
        for (let i = 0; i < timedata.length; i++) {
            if (timedata[i] == "/") {
                firstslash = i
            }
        }
        var y = (timedata.slice(firstslash + 1))
        if (y.length == 4) {
            var year = y.join("")
        } else {
            let x = String(timedata.slice(firstslash + 1, firstslash + 3).join(""))
            var year = ("20" + x)
        }
    }


    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == "/") {
            firstslash = i
            break
        }
    }

    var day = (timedata.slice(firstslash - 2, firstslash)).join("")
    if (day[0] == ' ') {
        day = "0" + day[1]
    }
    var month = (timedata.slice(firstslash + 1, firstslash + 3)).join("")

    if (month[1] == '/') {
        month = "0" + month[0]
    }
    let totalstring = (year + "-" + month + "-" + day + "T" + hour + ":" + minute + ":00")
    return (Date.parse(totalstring) / 1000)
}

function relativeresolution(timedata) {
    var startTime = Math.trunc(new Date().getTime() / 1000);
    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == " ") {
            delete timedata[i]
        }
    }

    const dataloc = new Map()
    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == "s" || timedata[i] == "m" || timedata[i] == "h" || timedata[i] == "d" || timedata[i] == "w") {
            dataloc.set(timedata[i], i)
        }
    }
    var unixdata = 0
    var previousval = 0
    var i = 0
    for (let entry of dataloc.entries()) {
        if (i == 0) {
            let first_val = entry[1]
            let convval = Number(conversionvalue(entry[0]))
            let value = Number((timedata.slice(0, first_val)).join(""))
            unixdata = unixdata + (convval * value)
            previousval = first_val
        } else {
            let val = entry[1]
            let convval = Number(conversionvalue(entry[0]))
            let value = Number((timedata.slice(previousval + 1, val).join("")))
            previousval = val

            unixdata = unixdata + (convval * value)
        }
        i = i + 1
    }
    return ((unixdata + startTime))
}

function main(message) {
    var inputstring = (message.split('')).slice(12)
    for (let i = 0; i < inputstring.length; i++) {
        var x = inputstring.length - i - 1 // Checks list in reverse order, so @s in the message arent counted
        if (inputstring[x] == "@") {
            var splitpoint = x
        }
    }
    var timedata = inputstring.slice(0, splitpoint)
    var content = inputstring.slice(splitpoint + 1).join("")
    var absolute = false
    for (let i = 0; i < timedata.length; i++) {
        if (timedata[i] == ":") {
            absolute = true
        }
    }
    if (absolute == true) {
        var time = absoluteresolution(timedata)
    } else {
        var time = relativeresolution(timedata)
    }
    return ([time, content])
}

x =
    //x[0] is unixtime for reminder to play
    //x[1] is the message content




    module.exports = {
        name: 'addreminder',
        description: `Create a new reminder. The delay for the reminder can be any combination of \'d, h, m, s\' as long as they are in order.\nExample: \`${prefix}addreminder 5d 30m @ Reminder here\` or \`${prefix}addreminder 3h 30m 20s @ Reminder here\``,
        guildOnly: true,
        args: true,
        usage: '<d h m s> @ <reminder>',
        cooldown: 5,
        async execute(message, args) {
            const { Reminders } = require('../index');
            var startTime = Math.trunc(new Date().getTime() / 1000);
            var channelIn = message.channel.id;

            const inputtedText = message.content;
            x = main(inputstring)

            try {
                await Reminders.create({
                    username: message.author.id,
                    reminder: reminder,
                    start_time: startTime,
                    end_duration: endTime,
                    channel_in: channelIn,
                    message_url: message.url,
                });


                var dateObject = new Date(endTime * 1000);
                var endMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                var endYear = dateObject.getFullYear();
                var endMonth = endMonths[dateObject.getMonth()];
                var endDate = ('0' + dateObject.getDate()).substr(-2);
                var endHour = ('0' + dateObject.getHours()).substr(-2);
                var endMin = ('0' + dateObject.getMinutes()).substr(-2);
                var endSec = ('0' + dateObject.getSeconds()).substr(-2);

                //message.reply(message.url);
                return message.reply('Your reminder for ' + endDate + ' ' + endMonth + ' ' + endYear + ' at ' + endHour + ':' + endMin + ':' + endSec + ' has been set!');
            } catch (error) {
                console.log(error);
                message.reply('Error:\n`' + error + '`');
            }
            return message.reply('Something went wrong with adding a reminder.');
        },
    };