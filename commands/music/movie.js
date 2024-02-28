const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = {
    name: 'movie',
    aliases: ['video'],
    utilisation: '{prefix}movie <urlまたは名前>',
    voiceChannel: true,

    async execute(client, message, args) {
        const query = args.join(' ');

        if (!query) {
            return message.channel.send(`${message.author}, 動画のURLまたは名前を指定してください`);
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send(`${message.author}, ボイスチャンネルに参加してください`);
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.channel.send(`${message.author}, ボイスチャンネルに接続する権限がありません`);
        }

        let videoInfo;
        try {
            if (ytdl.validateURL(query)) {
                videoInfo = await ytdl.getInfo(query);
            } else {
                const searchResults = await ytdl.search(query, { limit: 1 });
                videoInfo = searchResults[0];
            }
        } catch (error) {
            console.error(error);
            return message.channel.send(`${message.author}, 動画情報の取得中にエラーが発生しました`);
        }

        const embed = new MessageEmbed();
        embed.setColor('BLUE');
        embed.setTitle('動画情報');
        embed.setDescription(`**タイトル:** ${videoInfo.title}\n**投稿者:** ${videoInfo.author.name}\n**再生回数:** ${videoInfo.views}\n**評価:** ${videoInfo.likes} 👍 / ${videoInfo.dislikes} 👎`);

        const connection = await voiceChannel.join();
        const dispatcher = connection.play(ytdl(query, { filter: 'audioonly' }));

        message.channel.send({ embeds: [embed] });

        dispatcher.on('finish', () => {
            voiceChannel.leave();
        });

        dispatcher.on('error', (error) => {
            console.error(error);
            voiceChannel.leave();
            message.channel.send(`${message.author}, 動画の再生中にエラーが発生しました`);
        });
    },
};
