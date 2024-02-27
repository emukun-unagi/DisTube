const maxVol = require("../../config.js").opt.maxVol;

module.exports = {
    name: 'volume',
    aliases: ['vol'],
    utilisation: `{prefix}volume [1-${maxVol}]`,
    voiceChannel: true,

    execute(client, message, args) {
        const queue = client.player.getQueue(message.guild.id);

       if (!queue || !queue.playing) return message.channel.send(`${message.author}, 現在再生中の音楽はありません`);

        const vol = parseInt(args[0]);

        if (!vol) return message.channel.send(`現在の音量: **${queue.volume}**\n**ボリュームを変更するには \`1\` ~ \`${maxVol}\` の数字を入力してください**`);

        if (queue.volume === vol) return message.channel.send(`${message.author}, 変更しようとした音量は、すでに現在の音量です`);

        if (vol < 0 || vol > maxVol) return message.channel.send(`${message.author}, **ボリュームを変更する場合は、\`1\` ~ \`${maxVol}\` の数字を入力してください**`);

        const success = queue.setVolume(vol);

        return message.channel.send(success ? `音量変更: **${vol}**/**${maxVol}%**` : `${message.author}, どこかで間違っています`) ;
    },
};
