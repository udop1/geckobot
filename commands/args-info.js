module.exports = {
    name: 'args-info',
    description: 'Testing getting arguments from a string.',
    guildOnly: true,
    args: true,
    usage: '<text>',
    execute(message, args) {
        if (args[0] === 'foo') {
            return message.channel.send('bar');
        }
        
        message.channel.send(`Command Name: ${command}\nArguments: ${args}\nArgument Length: ${args.length}`);
    },
};