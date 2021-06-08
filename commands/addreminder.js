const {prefix} = require('../config.json');

module.exports = {
    name: 'addreminder',
    description: `Create a new reminder. The delay for the reminder can be any combination of \'d, h, m, s\' as long as they are in order.\nExample: \`${prefix}addreminder 5d 30m @ Reminder here\` or \`${prefix}addreminder 3h 30m 20s @ Reminder here\``,
    guildOnly: true,
    args: true,
    usage: '<d h m s> @ <reminder>',
    cooldown: 5,
    async execute(message, args) {
        const {Reminders} = require('../index');
        var startTime = Math.trunc(new Date().getTime() / 1000);
        var channelIn = message.channel.id;

        const inputtedText = message.content;
        var ans = inputtedText.split('');
        for (i = 0; i < 13; i++) {
            ans.splice(ans[0], 1);
        }

        var i;
        var todelete = [];
        var daybefore = 0;
        var hourbefore = 0;
        var minutebefore = 0;
        var secondbefore = 0;
        var days = 0;
        var hours = 0;
        var minutes = 0;
        var seconds = 0;

        for (i = 0; i < ans.length; i++) {
            if (ans[i] == '@') {
                var breakpoi = i;
            }
        }

        var reminder = ans.slice((breakpoi+1), ans.length);
        ans = ans.slice(0, breakpoi);

        for (i = 0; i < ans.length; i++) {
            if (ans[i] == ' ') {
                todelete.push(i);
            }
        }

        todelete.reverse();
        for (i = 0; i < todelete.length; i++) {
            ans.splice(todelete[i], 1);
        }

        for (i = 0; i < ans.length; i++) {
            if (ans[i] == 'd') {
                daybefore = i;
            } else if (ans[i] == 'h') {
                hourbefore = i;
            } else if (ans[i] == 'm') {
                minutebefore = i;
            } else if (ans[i] == 's') {
                secondbefore = i;
            }
        }


        if (daybefore != 0) {
            days = ans.slice(0, daybefore);
            if (hourbefore != 0) {
                hours = ans.slice((daybefore + 1), hourbefore);
            }
            if (minutebefore != 0) {
                if (hourbefore != 0) {
                    minutes = ans.slice((hourbefore + 1), minutebefore);
                } else {
                    minutes = ans.slice((daybefore + 1), minutebefore);
                }
            }
            if (secondbefore != 0) {
                if (minutebefore != 0) {
                    seconds = ans.slice((minutebefore + 1), (ans.length - 1));
                } else if (hourbefore != 0) {
                    seconds = ans.slice((hourbefore + 1), (ans.length - 1));
                } else {
                    seconds = ans.slice((daybefore + 1), (ans.length - 1));
                }
            }
        } else if (hourbefore != 0) {
            hours = ans.slice(0, hourbefore);
            if (minutebefore != 0) {
                minutes = ans.slice((hourbefore + 1), minutebefore);
            }
            if (secondbefore != 0) {
                if (minutebefore != 0) {
                    seconds = ans.slice((minutebefore + 1), (ans.length - 1));
                } else {
                    seconds = ans.slice((hourbefore + 1), (ans.length - 1));
                }
            }
        } else if (minutebefore != 0) {
            minutes = ans.slice(0, minutebefore);
            if (secondbefore != 0) {
                seconds = ans.slice((minutebefore + 1), (ans.length - 1));
            }
        } else {
            seconds = ans.slice(0, secondbefore);
        }

        if (days != 0) {
            days = Number.parseInt(days.join(''));
        }
        if (hours != 0) {
            hours = Number.parseInt(hours.join(''));
        }
        if (minutes != 0) {
            minutes = Number.parseInt(minutes.join(''));
        }
        if (seconds != 0) {
            seconds = Number.parseInt(seconds.join(''));
        }

        //UNIX converserverrsarsion thing
        days = days * 24 * 60 * 60;
        hours = hours * 60 * 60;
        minutes = minutes * 60;

        var unixTime = Math.trunc(days+hours+minutes+seconds);
        //console.log(unixTime);

        if (reminder[0] == ' ') {
            reminder = reminder.slice(1);
        }

        reminder = reminder.join('');
        //console.log(reminder);

        //message.reply('Start Time:'+startTime+'\nUnix Time:'+unixTime+'\nIts time to stop:'+(unixTime+startTime));
        var endTime = unixTime + startTime;
        
        //startTime = Math.floor(startTime);
        //endTime = Math.floor(endTime);

        try {
            await Reminders.create ({
                username: message.author.id,
                reminder: reminder,
                start_time: startTime,
                end_duration: endTime,
                channel_in: channelIn,
                message_url: message.url,
            });


            var dateObject = new Date(endTime * 1000);
            var endMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var endYear = dateObject.getFullYear();
            var endMonth = endMonths[dateObject.getMonth()];
            var endDate = ('0' + dateObject.getDate()).substr(-2);
            var endHour = ('0' + dateObject.getHours()).substr(-2);
            var endMin = ('0' + dateObject.getMinutes()).substr(-2);
            var endSec = ('0' + dateObject.getSeconds()).substr(-2);

            //message.reply(message.url);
            return message.reply('Your reminder for '+endDate+' '+endMonth+' '+endYear+' at '+endHour+':'+endMin+':'+endSec+' has been set!');
        }
        catch (error) {
            console.log(error);
            message.reply('Error:\n`'+error+'`');
        }
        return message.reply('Something went wrong with adding a reminder.');
    },
};