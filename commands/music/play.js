const { QueryType } = require('discord-player');
const { setTimeout } = require('timers/promises');

module.exports = {
    name: 'play',
    aliases: ['p'],
    utilisation: '{prefix}play [song name/URL]',
    voiceChannel: true,

    async execute(client, message, args) {
if (!args[0]) return message.channel.send(`${message.author}, 検索したい音楽の名前を書いてください`);

        const res = await client.player.search(args.join(' '), {
            requestedBy: message.member,
            searchJapanese: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return message.channel.send(`${message.author}, 音楽が見つかりませんでした`);

        const queue = await client.player.createQueue(message.guild, {
            metadata: message.channel
        });

        try {
            if (!queue.connection) await queue.connect(message.member.voice.channel);
        } catch {
            await client.player.deleteQueue(message.guild.id);
            return message.channel.send(`${message.author}, ボイスチャンネルに接続できませんでした`);
        }

        await message.channel.send(`${res.playlist ? 'Your Playlist' : 'Your Track'} 音楽を読み込み中...`)
        .then(msg => {
                msg.delete({ timeout: 20000 });
            })
        .catch();
       

        res.playlist ? queue.addTracks(res.tracks) : queue.addTrack(res.tracks[0]);

        if (!queue.playing) await queue.play();
      
    },
};
