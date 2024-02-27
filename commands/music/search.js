const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
    name: 'search',
    aliases: [],
    utilisation: '{prefix}search [song name]',
    voiceChannel: true,

    async execute(client, message, args) {
      
if (!args[0]) return message.channel.send(`${message.author}, 音楽の名前を入力してください`);

        const res = await client.player.search(args.join(' '), {
            requestedBy: message.member,
            searchEngine: QueryType.AUTO
        });

        if (!res || !res.tracks.length) return message.channel.send(`${message.author}, 検索結果が見つかりません `);

        const queue = await client.player.createQueue(message.guild, {
            metadata: message.channel
        });

        const embed = new MessageEmbed();

        embed.setColor('RED');
        embed.setTitle(`Searched Music: ${args.join(' ')}`);

        const maxTracks = res.tracks.slice(0, 10);

        embed.setDescription(`${maxTracks.map((track, i) => `**${i + 1}**. ${track.title} | ${track.author}`).join('\n')}\n\n **1** ~ **${maxTracks.length}** から音楽を選び番号を送ってください。キャンセルの場合は**cancel**と送ってください`);

        embed.setTimestamp();
        embed.setFooter('DisTube', message.author.avatarURL({ dynamic: true }));

        message.channel.send({ embeds: [embed] });

        const collector = message.channel.createMessageCollector({
            time: 15000,
            errors: ['time'],
            filter: m => m.author.id === message.author.id
        });

       collector.on('collect', async (query) => {
            if (query.content.toLowerCase() === 'cancel') return message.channel.send(`Call cancelled.`) && collector.stop();

            const value = parseInt(query.content);

            if (!value || value <= 0 || value > maxTracks.length) return message.channel.send(`**1** から **${maxTracks.length}** までの番号を選択してください。または **cancel** で選択をキャンセルできます`);

            collector.stop();

            try {
                if (!queue.connection) await queue.connect(message.member.voice.channel);
            } catch {
                await client.player.deleteQueue(message.guild.id);
                return message.channel.send(`${message.author}, I can't join audio channel.`);
            }

            await message.channel.send(`音楽を読み込み中...`)
            .then(msg => {
                msg.delete({ timeout: 50000 });
            })
            .catch();
            queue.addTrack(res.tracks[Number(query.content)-1]);
            if (!queue.playing) await queue.play();
           
        });

        collector.on('end', (msg, reason) => {
            if (reason === 'time') return message.channel.send(`${message.author}, 検索時間が切れました`);
        });
    },
};
