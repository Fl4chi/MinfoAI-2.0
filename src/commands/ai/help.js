const { SlashCommandBuilder } = require('discord.js');
const conversationalAI = require('../../ai/conversationalAI');
const contextBuilder = require('../../utils/contextBuilder');
const errorLogger = require('../../utils/errorLogger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-help')
        .setDescription('🤖 Chiedi consigli su partnership, miglioramenti server o risolvi problemi')
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
        await interaction.deferReply({ ephemeral: true }); // FIX: ephemeral qui, non in editReply!

        try {
            const question = interaction.options.getString('question');
            const contextParam = interaction.options.getString('context');

            // Rate limiting semplice
            const userId = interaction.user.id;
            const now = Date.now();
            if (!global.aiHelpCooldowns) global.aiHelpCooldowns = new Map();

            const userCooldown = global.aiHelpCooldowns.get(userId);
            if (userCooldown && now - userCooldown < 5000) {
                const timeLeft = Math.ceil((5000 - (now - userCooldown)) / 1000);
                return interaction.editReply(`⏱️ Attendi ${timeLeft} secondi prima di fare un'altra domanda.`);
            }

            global.aiHelpCooldowns.set(userId, now);

            // Log della domanda
            errorLogger.logInfo(`AI-HELP: ${interaction.user.tag} asked: "${question}"`, 'AI_ASSISTANT');

            // Costruisci contesto
            const context = await contextBuilder.buildUserContext(interaction, contextParam);

            // Chiedi all'AI
            const aiResponse = await conversationalAI.askQuestion(question, context);

            // Risposta semplice e pulita (EPHEMERAL già settato nel deferReply)
            await interaction.editReply(aiResponse);

        } catch (error) {
            errorLogger.logError('ERROR', 'Errore comando ai-help', 'AI_HELP_ERROR', error);

            await interaction.editReply('❌ Si è verificato un errore. Riprova tra qualche secondo o contatta lo staff.');
        }
    }
};
