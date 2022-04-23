# Gecko Bot
This is a Discord.js bot that was created for my Discord server


## Features
- Slash commands
- Ability to create reminders
- Reminders can also be recurring
- Get current value of any cryptocurrency on Binance
- Mass delete messages


## Upcoming
- Reminder snooze button
- Ability to use features of the bot on it's web interface


## Usage
#### /addreminder
This command allows you to set a reminder. Some examples of how you can use this command are:
```
/addreminder 10h 32m 5s This is a reminder message
/addreminder 11:43 This is a reminder message
/addreminder 11:43 15/08/2022 This is a reminder message
```

#### /viewreminders
This command allows you to see all the reminders you've set. This includes the message ID (so you can delete the reminder), the message, when the reminder was set, when it will end, and a link that takes you to the orginal message. You can use this command with:
```
/viewreminders
```

#### /deletereminders
This command allows you to delete one of your reminders, where the number would be replaced with your reminder ID. You can get the ID of a reminder with the `!viewreminders` command. You can use this command with:
```
/deletereminder 1172
```

#### /getprice
This command allows you to get the current value of any cryptocurrency on Binance. Some examples of how you can use this command are:
```
/getprice DOGEBUSD
/getprice BTCGBP
/getprice XLMBTC
```

#### /prune
This command allows you to mass delete messages. An example of how you can use this command is:
```
/prune 50
```
