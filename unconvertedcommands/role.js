module.exports = {
    name: 'role',
    description: 'Add or remove a role.',
    args: true,
    async execute(message, args) {
        const messageOwner = message.member;

        if (args[0] == "add") {
            args = args.slice(1).join(" ");
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase() === args.toLowerCase());

            if (role === undefined) {
                return message.reply("That is not a valid role.");
            } else {
                //messageOwner.roles.add(role);
                return message.reply(`The ${role.name} role has been added!`);
            }
        } else if (args[0] == "remove") {
            args = args.slice(1).join(" ");
            const role = message.guild.roles.cache.find(role => role.name.toLowerCase() === args.toLowerCase());

            if (role === undefined) {
                return message.reply("That is not a valid role.");
            } else {
                //messageOwner.roles.remove(role);
                return message.reply(`The ${role.name} role has been removed!`);
            }
        } else {
            return message.reply("You need to choose to add or remove a role.");
        }
    },
};
