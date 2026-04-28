const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Keep-Alive: Bot is running!'));
app.listen(10000, '0.0.0.0');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.once('clientReady', (c) => console.log(`Ready! Logged in as ${c.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('**❌ 權限不足**').then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bind_account')
                .setLabel('🔗 立即綁定帳號')
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Players\'Tavern | 自動驗證系統')
            .setDescription('**點擊下方按鈕填寫資料，系統將嘗試透過控制台自動開啟白名單。**')
            .addFields(
                { name: '👥 營運團隊', value: '`02_player` 及 全體管理員', inline: true }
            )
            .setFooter({ text: 'Players\'Tavern | Console 連動模式' })
            .setTimestamp()
            .setColor(0x2F3136);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('身分驗證面板');
        const idInput = new TextInputBuilder().setCustomId('mc_id').setLabel("遊戲 ID").setPlaceholder("Minecraft ID").setStyle(TextInputStyle.Short).setRequired(true);
        const versionInput = new TextInputBuilder().setCustomId('mc_ver').setLabel("版本 (Java/Bedrock)").setPlaceholder("Java 或 Bedrock").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(idInput), new ActionRowBuilder().addComponents(versionInput));
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await interaction.deferReply({ ephemeral: true });

        const mcId = interaction.fields.getTextInputValue('mc_id');
        const ver = interaction.fields.getTextInputValue('mc_ver').toLowerCase();
        let finalId = (ver.includes('bedrock') || ver.includes('基岩')) ? '.' + mcId : mcId;

        try {
            const cmdChannel = await client.channels.fetch(process.env.CMD_CHANNEL_ID);
            
            await cmdChannel.send(`/console whitelist add ${finalId}`);

            await interaction.editReply({ content: `**✅ 指令已發出**\n已執行：\`/console whitelist add ${finalId}\`` });
        } catch (error) {
            await interaction.editReply({ content: `**❌ 發送失敗**\n請確認 CMD_CHANNEL_ID 設定正確。` });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
