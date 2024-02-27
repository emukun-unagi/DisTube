module.exports = {
    name: 'clear',
    aliases: ['c'],
    utilisation: '{prefix}clear',
    voiceChannel: true,

    async execute(client, message) {
        const queue = client.player.getQueue(message.guild.id);

        if (!queue || !queue.playing) return message.channel.send(`${message.author}, 現在再生中の音楽はありません`);

        if (!queue.tracks[0]) return message.channel.send(`${message.author}, この曲の後に再生する音楽はありません`);

        await queue.clear();

        message.channel.send(`プレイリストを削除しました`);
    },
};
