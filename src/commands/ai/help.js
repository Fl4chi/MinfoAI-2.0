const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const conversationalAI = require('../../ai/conversationalAI');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-help')
        .setDescription('🤖 Chiedi consigli su partnership, miglioramenti server o risolvi problemi')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('La tua domanda o problema')
                .setRequired(true)
                .setMaxLength(500)),

    async execute(interaction) {
        const startTime = Date.now();
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const question = interaction.options.getString('question');

            // Rate limiting
            const userId = interaction.user.id;
            const now = Date.now();
            if (!global.aiHelpCooldowns) global.aiHelpCooldowns = new Map();

            const userCooldown = global.aiHelpCooldowns.get(userId);
            if (userCooldown && now - userCooldown < 5000) {
                const timeLeft = Math.ceil((5000 - (now - userCooldown)) / 1000);
                return interaction.editReply(`⏱️ Attendi ${timeLeft} secondi prima di fare un'altra domanda.`);
            }

            global.aiHelpCooldowns.set(userId, now);

            // Log
            console.log(`\n🤖 [AI-HELP] ${interaction.user.tag}: "${question.substring(0, 80)}"`);

            // Chiedi all'AI
            const aiResponse = await conversationalAI.askQuestion(question, {});

            const responseTime = Date.now() - startTime;
            console.log(`   ✅ Risposta inviata (${responseTime}ms)\n`);

            await interaction.editReply(aiResponse);

        } catch (error) {
            console.error(`   ❌ ERRORE AI-HELP:`, error.message);
            await interaction.editReply('❌ Si è verificato un errore. Riprova tra qualche secondo.');
        }
    }
};
