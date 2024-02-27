const { MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'board',
    aliases: ['recent'],
    utilisation: '{prefix}board',
    voiceChannel: true,

    async execute(client, message, args) {
        // Read the content of music.txt
        const musicHistory = fs.readFileSync('music.txt', 'utf8');
        const recentTracks = musicHistory.split('\n').filter(track => track.trim() !== '');

        if (recentTracks.length === 0) {
            return message.channel.send(`${message.author}, 最近再生された音楽はありません ❌`);
        }

        const embed = new MessageEmbed();
        embed.setColor('BLUE');
        embed.setTitle('最近再生された音楽');

        const maxTracks = recentTracks.slice(-10);

        embed.setDescription(`${maxTracks.map((track, i) => `**${i + 1}**. ${track}`).join('\n')}\n\n **1** ~ **${maxTracks.length}** から音楽を選び番号を送ってください。キャンセルの場合は**cancel**と送ってください⬇️`);

        embed.setTimestamp();
        embed.setFooter('DisTube', message.author.avatarURL({ dynamic: true }));

        message.channel.send({ embeds: [embed] });

        const collector = message.channel.createMessageCollector({
            time: 15000,
            errors: ['time'],
            filter: m => m.author.id === message.author.id
        });

        collector.on('collect', async (query) => {
            if (query.content.toLowerCase() === 'cancel') {
                message.channel.send('コマンドがキャンセルされました。 ✅');
                return collector.stop();
            }

            const value = parseInt(query.content);

            if (!value || value <= 0 || value > maxTracks.length) {
                return message.channel.send(`エラー: 音楽を **1** から **${maxTracks.length}** までの番号で選択してください。または **cancel** で選択をキャンセルできます。 ❌`);
            }

            collector.stop();

            // Display loading message and delete it after 50 seconds
            await message.channel.send(`Loading your music call. 🎧`)
                .then(msg => {
                    msg.delete({ timeout: 50000 });
                })
                .catch();

            // Play the selected track
            const res = await client.player.search(maxTracks[value - 1], {
                requestedBy: message.member,
            });

            if (!res || !res.tracks.length) {
                return message.channel.send(`${message.author}, 選択された音楽が見つかりませんでした。 ❌`);
            }

            const queue = await client.player.createQueue(message.guild, {
                metadata: message.channel,
            });

            try {
                if (!queue.connection) await queue.connect(message.member.voice.channel);
            } catch {
                await client.player.deleteQueue(message.guild.id);
                return message.channel.send(`${message.author}, オーディオチャンネルに参加できませんでした。 ❌`);
            }

            await message.channel.send(`音楽を読み込んでいます... 🎧`);
            queue.addTrack(res.tracks[0]);

            if (!queue.playing) await queue.play();
        });

        collector.on('end', (msg, reason) => {
            if (reason === 'time') {
                message.channel.send(`${message.author}, 選択時間が終了しました。 ❌`);
            }
        });
    },
};
