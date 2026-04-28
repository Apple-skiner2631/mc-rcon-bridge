const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');
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
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bind_account')
                .setLabel('**🔗綁定帳號**')
                .setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setTitle('**🔑 需要驗證**')
            .setDescription('**歡迎來到** **Players\'Tavern**！**為了進入伺服器，您必須驗證您的 Minecraft 帳號。**\n\n📜 **請先閱讀：**\n**[規則與指令](http://plays-survival.playwithbao.com:31031/#world:0:0:0:1500:0:0:0:0:perspective)**\n\n**如何驗證：**\n1. **點擊下方的** **綁定帳號** 按鈕。\n**2. 輸入您的遊戲 ID 與版本。**\n**3. 指令將自動送出，請稍候進入伺服器。**\n\n**Players\'Tavern | 驗證系統**')
            .setColor(0x00AE86);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('**Players\'Tavern 帳號驗證**');
        
        const idInput = new TextInputBuilder()
            .setCustomId('mc_id')
            .setLabel("**您的 Minecraft ID**")
            .setPlaceholder("**例如: Player123**")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const versionInput = new TextInputBuilder()
            .setCustomId('mc_ver')
            .setLabel("**版本 (請輸入 Java 或 Bedrock)**")
            .setPlaceholder("**Java / Bedrock**")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput), 
            new ActionRowBuilder().addComponents(versionInput)
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        const mcId = interaction.fields.getTextInputValue('mc_id');
        const ver = interaction.fields.getTextInputValue('mc_ver').toLowerCase();
        
        let finalId = mcId;
        if (ver.includes('bedrock') || ver.includes('基岩')) {
            finalId = '.' + mcId;
        }

        try {
            await axios.post(process.env.WEBHOOK_URL, {
                content: `!run whitelist add ${finalId}`
            });
            await interaction.reply({ content: `**✅ 指令已送出！已將** **${finalId}** **加入白名單。**`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `**❌ 系統發送失敗，請聯繫管理員。**`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
