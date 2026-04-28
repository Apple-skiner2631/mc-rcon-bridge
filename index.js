const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const axios = require('axios');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Keep-Alive: Bot is running!'));
app.listen(10000);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log('Bot is ready!'));

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('Player帳號驗證');
        
        const idInput = new TextInputBuilder()
            .setCustomId('mc_id')
            .setLabel("您的 Minecraft ID")
            .setPlaceholder("例如: Player123")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const versionInput = new TextInputBuilder()
            .setCustomId('mc_ver')
            .setLabel("版本 (請輸入 Java 或 Bedrock)")
            .setPlaceholder("Java / Bedrock")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(idInput), new ActionRowBuilder().addComponents(versionInput));
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
            await interaction.reply({ content: `✅ 指令已送出！已將 **${finalId}** 加入白名單。`, ephemeral: true });
        } catch (error) {
            await interaction.reply({ content: `❌ 系統發送失敗，請聯繫管理員。`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
