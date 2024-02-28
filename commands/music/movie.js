const { QueryType } = require('discord-player');
const { setTimeout } = require('timers/promises');

module.exports = {
    name: 'movie',
    aliases: ['m'],
    utilisation: '{prefix}movie [video name/URL]',
    voiceChannel: true,

    async execute(client, message, args) {
        if (!args[0]) return message.channel.send(`${message.author}, 動画の名前またはURLを指定してください`);

        const query = args.join(' ');
        const res = await client.player.search(query, {
            requestedBy: message.member,
            searchJapanese: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return message.channel.send(`${message.author}, 動画が見つかりませんでした`);

        const queue = await client.player.createQueue(message.guild, {
            metadata: message.channel
        });

        try {
            if (!queue.connection) await queue.connect(message.member.voice.channel);
        } catch {
            await client.player.deleteQueue(message.guild.id);
            return message.channel.send(`${message.author}, ボイスチャンネルに接続できませんでした`);
        }

        await queue.connection.play(res.tracks[0].url, { type: 'opus' });

        await message.channel.send(`動画を読み込み中...`)
            .then(msg => {
                msg.delete({ timeout: 20000 });
            })
            .catch();
    },
};
