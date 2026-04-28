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
            return message.reply('**❌ 權限不足**').then(msg => { setTimeout(() => msg.delete(), 5000); });
        }
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bind_account').setLabel('🔗 申請白名單').setStyle(ButtonStyle.Success)
        );
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Players\'Tavern | 帳號驗證')
            .setDescription('**點擊下方按鈕提交 ID，管理員將手動為您開啟。**')
            .setColor(0x2F3136);
        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('身分驗證');
        const idInput = new TextInputBuilder().setCustomId('mc_id').setLabel("遊戲 ID").setPlaceholder("輸入 ID").setStyle(TextInputStyle.Short).setRequired(true);
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
            // 這個 ID 請設定為你的私密管理頻道（或 DMCC 頻道）
            const adminChannel = await client.channels.fetch(process.env.CMD_CHANNEL_ID);
            
            const adminEmbed = new EmbedBuilder()
                .setTitle('🆕 新白名單申請')
                .addFields(
                    { name: '申請人', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '遊戲 ID', value: `\`${finalId}\``, inline: true },
                    { name: '點擊複製指令 (傳送至 DMCC)', value: `\`/console whitelist add ${finalId}\``, inline: false }
                )
                .setColor(0xFFA500)
                .setTimestamp();

            await adminChannel.send({ embeds: [adminEmbed] });
            await interaction.editReply({ content: `**✅ 申請已送出！**\n管理員已收到通知，請耐心等候審核。` });
        } catch (error) {
            await interaction.editReply({ content: `**❌ 系統錯誤**\n請檢查環境變數 CMD_CHANNEL_ID。` });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
