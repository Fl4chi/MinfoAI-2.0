const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const conversationalAI = require('../../ai/conversationalAI');
const contextBuilder = require('../../utils/contextBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-help')
        .setDescription('🤖 Chiedi aiuto all\'assistente AI per partnership, problemi o domande')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La tua domanda o problema')
                .setRequired(true)
                .setMaxLength(500))
        .addStringOption(option =>
            option.setName('context')
                .setDescription('Contesto aggiuntivo (es: partnership-id, error-code)')
                .setRequired(false)
                .setMaxLength(100)),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const question = interaction.options.getString('question');
            const contextParam = interaction.options.getString('context');

            // Rate limiting semplice
            const userId = interaction.user.id;
            const now = Date.now();
            if (!global.aiHelpCooldowns) global.aiHelpCooldowns = new Map();

            const userCooldown = global.aiHelpCooldowns.get(userId);
            if (userCooldown && now - userCooldown < 30000) {
                const timeLeft = Math.ceil((30000 - (now - userCooldown)) / 1000);
                return interaction.editReply({
                    content: `⏱️ Attendi ${timeLeft} secondi prima di fare un'altra domanda.`,
                });
            }

            global.aiHelpCooldowns.set(userId, now);

            // Log della domanda
            errorLogger.logInfo(`AI-HELP: ${interaction.user.tag} asked: "${question}"`, 'AI_ASSISTANT');

            // Costruisci contesto
            const context = await contextBuilder.buildUserContext(interaction, contextParam);

            // Chiedi all'AI
            const aiResponse = await conversationalAI.askQuestion(question, context);

            // Crea embed risposta
            const responseEmbed = new EmbedBuilder()
                .setColor('#00F0FF')
                .setAuthor({
                    name: 'MinfoAI Assistant 🤖',
                    iconURL: interaction.client.user.displayAvatarURL()
                })
                .setDescription(`**Domanda:**\n${question}\n\n**Risposta:**\n${aiResponse}`)
                .setFooter({
                    text: `Richiesto da ${interaction.user.tag} • Powered by LLaMA 2`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Se il contesto include una partnership, aggiungi info
            if (context.partnershipId) {
                responseEmbed.addFields({
                    name: '🔗 Riferimento',
                    value: `Partnership ID: \`${context.partnershipId}\``,
                    inline: true
                });
            }

            await interaction.editReply({ embeds: [responseEmbed] });

        } catch (error) {
            errorLogger.logError('ERROR', 'Errore comando ai-help', 'AI_HELP_ERROR', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Errore AI Assistant')
                .setDescription('Non sono riuscito a processare la tua domanda.')
                .addFields(
                    { name: '💡 Suggerimenti:', value: '• Riprova tra qualche secondo\n• Verifica che la domanda sia chiara\n• Contatta lo staff se il problema persiste' }
                )
                .setFooter({ text: 'MinfoAI 2.0 • AI Assistant' });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
