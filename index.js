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

client.once('ready', () => console.log('Bot is ready!'));

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('**❌ 權限不足。**').then(msg => {
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
            .setTitle('🤨 Players\'Tavern | 自動驗證系統')
            .setDescription('**點擊下方按鈕，系統將透過控制台自動為您開啟白名單。**')
            .setFooter({ text: 'Players\'Tavern 官方系統' })
            .setTimestamp()
            .setColor(0x2F3136);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('身分驗證面板');
        const idInput = new TextInputBuilder().setCustomId('mc_id').setLabel("遊戲 ID").setPlaceholder("輸入 Minecraft ID").setStyle(TextInputStyle.Short).setRequired(true);
        const versionInput = new TextInputBuilder().setCustomId('mc_ver').setLabel("版本 (Java/Bedrock)").setPlaceholder("例如: Bedrock").setStyle(TextInputStyle.Short).setRequired(true);
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
            
            // 這裡使用你說的 /console 功能前綴
            // 如果模組規定格式是 /console whitelist add ... 就用下面這行
            await cmdChannel.send(`/console whitelist add ${finalId}`);

            await interaction.editReply({ content: `**✅ 指令已發送至 Console！**\n已為 **${finalId}** 執行白名單指令。` });
        } catch (error) {
            await interaction.editReply({ content: `**❌ 發送失敗**\n請檢查 CMD_CHANNEL_ID 是否正確。` });
        }
    }
});

client.login(process.env.D
             ISCORD_TOKEN);
