const { Permissions } = require('discord.js');

module.exports = {
    name: 'prune',
    description: 'Use the prune command to remove 1 to 99 messages.',
    options: [
        {
            name: "number",
            description: "Number of messages to remove",
            type: 4, //Integer
            required: true,
        },
    ],
    async execute(interaction) {
        if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            const amount = interaction.options.getInteger('number');

            if (isNaN(amount)) {
                return interaction.reply({ content: 'That doesn\'t seem to be a valid number.', ephemeral: true });
            } else if (amount <= 1 || amount > 100) {
                return interaction.reply({ content: 'You need to input a number between 1 and 99.', ephemeral: true });
            }

            interaction.channel.bulkDelete(amount, true)
            .then(messages => {
                interaction.reply(`Bulk deleted ${messages.size} messages.`);
            })
            .catch(err => {
                console.error(err);
                interaction.reply({ content: 'There was an error trying to prune messages in this channel!', ephemeral: true });
            });
        } else {
            interaction.reply({ content: 'You don\'t have the required permissions to remove messages.', ephemeral: true });
        }
    },
};