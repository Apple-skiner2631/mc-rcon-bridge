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
            return message.reply('**❌ 只有管理員可以使用此指令。**').then(msg => {
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
            .setTitle('🤨 Players\'Tavern | 帳號驗證系統')
            .setDescription('**歡迎來到 Players\'Tavern！為了確保遊戲品質與社群安全，進入伺服器前請先完成 Discord 帳號綁定。**')
            .addFields(
                { name: '📜 冒險者規範', value: '**[規則與指令](http://plays-survival.playwithbao.com:31031/#world:0:0:0:1500:0:0:0:0:perspective)**\n*進入前請務必詳閱，以免觸犯禁令。*', inline: false },
                { name: '🛠️ 驗證流程', value: '1️⃣ 點擊下方 **「🔗 立即綁定帳號」** 按鈕\n2️⃣ 準確輸入您的 **遊戲 ID**\n3️⃣ 選擇您使用的 **遊戲版本** (Java/Bedrock)\n4️⃣ 點擊送出，系統將自動處理', inline: false },
                { name: '👥 營運團隊', value: '`02_player` 及 全體管理員', inline: true }
            )
            .setFooter({ text: 'Players\'Tavern 官方認證系統', iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            .setColor(0x2F3136);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('身分驗證面板');
        
        const idInput = new TextInputBuilder()
            .setCustomId('mc_id')
            .setLabel("遊戲 ID")
            .setPlaceholder("請輸入您的 Minecraft 角色名稱")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const versionInput = new TextInputBuilder()
            .setCustomId('mc_ver')
            .setLabel("版本 (請輸入 Java 或 Bedrock)")
            .setPlaceholder("例如: Bedrock")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput), 
            new ActionRowBuilder().addComponents(versionInput)
        );
        await interaction.showModal(modal);
    }
if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await interaction.deferReply({ ephemeral: true });

        const mcId = interaction.fields.getTextInputValue('mc_id');
        const ver = interaction.fields.getTextInputValue('mc_ver').toLowerCase();
        

        let finalId = mcId;
        if (ver.includes('bedrock') || ver.includes('基岩')) {
            finalId = '.' + mcId;
        }

        try {

            const cmdChannel = await client.channels.fetch(process.env.CMD_CHANNEL_ID);

            await cmdChannel.send(`whitelist add ${finalId}`);


            await cmdChannel.send(`team join 02_player ${finalId}`);

            await interaction.editReply({ 
                content: `**✅ 申請成功！**\n帳號 **${finalId}** 已成功加入白名單並分配至隊伍。\n祝您在 **Players'Tavern** 有個愉快的冒險！` 
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `**❌ 系統錯誤**\n請確認 Render 的 CMD_CHANNEL_ID 環境變數設定正確，且機器人有該頻道發言權限。` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
