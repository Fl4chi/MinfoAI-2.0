const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');
const chalk = require('chalk');
const Partnership = require('../database/partnershipSchema');
const GuildConfig = require('../database/guildConfigSchema');
const UserEconomy = require('../database/userEconomySchema');
const CustomEmbedBuilder = require('./embedBuilder');

/**
 * ButtonHandler - Gestisce la creazione e il routing dei bottoni per le partnership
 * Supporta: Approve, Reject, View Details, Cancel, Shop
 */
class ButtonHandler {
  constructor(advancedLogger = null) {
    this.logger = advancedLogger;
  }

  createPartnershipDecisionButtons(partnerId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_${partnerId}`)
          .setLabel('✅ Approva')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${partnerId}`)
          .setLabel('❌ Rifiuta')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`view_${partnerId}`)
          .setLabel('📋 Visualizza')
          .setStyle(ButtonStyle.Primary)
      );
    return row;
  }

  createConfirmationButtons(actionId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_${actionId}`)
          .setLabel('✓ Conferma')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`cancel_${actionId}`)
          .setLabel('✗ Annulla')
          .setStyle(ButtonStyle.Secondary)
      );
    return row;
  }

  createPartnershipActionButtons(partnerId) {
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`delete_${partnerId}`)
          .setLabel('🗑️ Elimina')
          .setStyle(ButtonStyle.Danger)
      );
    return row;
  }

  createPartnershipRejectButtons(partnerId) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`view_${partnerId}`).setLabel('📋 Dettagli').setStyle(ButtonStyle.Secondary)
    );
  }

  parseButtonId(customId) {
    const parts = customId.split('_');
    const action = parts[0];
    const id = parts.slice(1).join('_');
    return { action, id };
  }

  async handleButtonInteraction(interaction, handlers = {}) {
    try {
      const { action, id } = this.parseButtonId(interaction.customId);

      if (this.logger) {
        this.logger.info(`[BUTTON] Bottone cliccato: ${action} | Partner ID: ${id} | Utente: ${interaction.user.tag}`);
      }

      // Defer la risposta
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Chiama l'handler specifico se esiste
      if (handlers[action] && typeof handlers[action] === 'function') {
        await handlers[action](interaction, id);
      } else {
        // Handler di default con logica reale
        await this.defaultButtonHandler(interaction, action, id);
      }
    } catch (error) {
      console.error(chalk.red(`[BUTTON ERROR] ${error.message}`));
      if (!interaction.replied) {
        await interaction.editReply({
          content: '❌ Si è verificato un errore durante l\'elaborazione del bottone.'
        }).catch(() => { });
      }
    }
  }

  async defaultButtonHandler(interaction, action, id) {
    try {
      if (action === 'approve') {
        const partnership = await Partnership.findOne({ partnershipId: id });
        if (!partnership) return interaction.editReply('❌ Partnership non trovata.');

        if (partnership.status === 'active') return interaction.editReply('⚠️ Partnership già attiva.');

        partnership.status = 'active';
        partnership.approvedBy = interaction.user.id;
        partnership.approvedAt = new Date();
        await partnership.save();

        const embed = CustomEmbedBuilder.success('✅ Partnership Approvata', `La partnership con **${partnership.primaryGuild.serverName}** è ora attiva.`);
        await interaction.editReply({ embeds: [embed] });
      }
      else if (action === 'reject') {
        const partnership = await Partnership.findOne({ partnershipId: id });
        if (!partnership) return interaction.editReply('❌ Partnership non trovata.');

        partnership.status = 'rejected';
        partnership.rejectedBy = interaction.user.id;
        partnership.rejectedAt = new Date();
        await partnership.save();

        const embed = CustomEmbedBuilder.error('❌ Partnership Rifiutata', `La partnership con **${partnership.primaryGuild.serverName}** è stata rifiutata.`);
        await interaction.editReply({ embeds: [embed] });
      }
      else if (action === 'view') {
        const partnership = await Partnership.findOne({ partnershipId: id });
        if (!partnership) return interaction.editReply('❌ Partnership non trovata.');

        const embed = CustomEmbedBuilder.info(`🔍 Dettagli Partnership`,
          `**Server:** ${partnership.primaryGuild.serverName}\n` +
          `**ID:** \`${partnership.partnershipId}\`\n` +
          `**Status:** ${partnership.status}\n` +
          `**Descrizione:** ${partnership.primaryGuild.description}`);

        await interaction.editReply({ embeds: [embed] });
      }
      else if (action === 'delete') {
        await Partnership.findOneAndDelete({ partnershipId: id });
        await interaction.editReply('🗑️ Partnership eliminata dal database.');
      }
      else if (action === 'shop') {
        // Format: shop_buy_boost_3d or shop_buy_reset_cooldown or shop_buy_tier_silver
        const parts = id.split('_');
        const subAction = parts[1]; // boost, reset, tier
        const variant = parts[2]; // 3d, 1d, cooldown, silver, gold, platinum

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!guildConfig) return interaction.editReply('❌ Configurazione server non trovata.');

        // Costi
        const costs = {
          'boost_3d': 500,
          'boost_1d': 200,
          'reset_cooldown': 500
        };

        const itemKey = variant ? `${subAction}_${variant}` : subAction;
        const cost = costs[itemKey];

        if (!cost && subAction !== 'tier') return interaction.editReply('❌ Oggetto non riconosciuto.');

        // Check Balance
        let userEco = await UserEconomy.findOne({ userId: interaction.user.id });
        if (!userEco || userEco.balance < cost) {
          return interaction.editReply(`❌ **Fondi Insufficienti!** Hai solo ${userEco ? userEco.balance : 0} Coins.`);
        }

        // Deduct Coins
        userEco.balance -= cost;
        userEco.transactions.push({
          type: 'SPEND',
          amount: cost,
          reason: `Shop: ${itemKey}`
        });
        await userEco.save();

        // Apply Effect
        if (subAction === 'boost') {
          const durationDays = variant === '3d' ? 3 : 1;
          const durationMs = durationDays * 24 * 60 * 60 * 1000;

          guildConfig.economy.boostActive = true;
          // Extend if already active, else set new
          const currentExpiry = guildConfig.economy.boostExpiresAt && guildConfig.economy.boostExpiresAt > new Date()
            ? guildConfig.economy.boostExpiresAt.getTime()
            : Date.now();

          guildConfig.economy.boostExpiresAt = new Date(currentExpiry + durationMs);
          await guildConfig.save();

          await interaction.editReply(`🚀 **Boost Attivato!** Durata: ${durationDays} giorni.\nScadenza: <t:${Math.floor(guildConfig.economy.boostExpiresAt.getTime() / 1000)}:R>`);
        }
        else if (subAction === 'reset') {
          guildConfig.serverProfile.lastPostDate = null;
          await guildConfig.save();
          await interaction.editReply('🔄 **Cooldown Resettato!** Puoi postare una nuova partnership immediatamente.');
        }
        else if (subAction === 'tier') {
          // Format: shop_buy_tier_silver/gold/platinum
          const targetTier = variant; // silver, gold, platinum
          const currentTier = guildConfig.economy.tier || 'bronze';

          // Tier costs
          const tierCosts = { silver: 1000, gold: 2500, platinum: 5000 };
          const cost = tierCosts[targetTier];

          if (!cost) return interaction.editReply('❌ Tier non valido.');

          // Check balance
          let userEco = await UserEconomy.findOne({ userId: interaction.user.id });
          if (!userEco || userEco.balance < cost) {
            return interaction.editReply(`❌ **Fondi Insufficienti!** Servono ${cost} Coins, hai solo ${userEco ? userEco.balance : 0}.`);
          }

          // Check tier progression
          const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
          const currentIndex = tierOrder.indexOf(currentTier);
          const targetIndex = tierOrder.indexOf(targetTier);

          if (targetIndex !== currentIndex + 1) {
            return interaction.editReply(`❌ Devi sbloccare i tier in ordine! Attualmente sei **${currentTier.toUpperCase()}**.`);
          }

          // Check objectives
          const stats = guildConfig.economy.tierStats || {};
          const accountAgeDays = userEco.createdAt ? Math.floor((Date.now() - userEco.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

          let objectivesFailed = [];

          if (targetTier === 'silver') {
            if (stats.totalPartnerships < 10) objectivesFailed.push(`Partnership: ${stats.totalPartnerships}/10`);
            if (accountAgeDays < 30) objectivesFailed.push(`Attività: ${accountAgeDays}/30 giorni`);
            if (stats.rejectedLast15Days > 0) objectivesFailed.push(`Rifiuti ultimi 15gg: ${stats.rejectedLast15Days}/0`);
            // Trust score check would go here
          } else if (targetTier === 'gold') {
            if (stats.totalPartnerships < 30) objectivesFailed.push(`Partnership: ${stats.totalPartnerships}/30`);
            if (stats.activePartnerships < 15) objectivesFailed.push(`Partnership attive: ${stats.activePartnerships}/15`);
            if (accountAgeDays < 60) objectivesFailed.push(`Attività: ${accountAgeDays}/60 giorni`);
            if (stats.rejectedLast30Days > 0) objectivesFailed.push(`Rifiuti ultimi 30gg: ${stats.rejectedLast30Days}/0`);

            const silverDays = stats.silverUnlockedAt ? Math.floor((Date.now() - stats.silverUnlockedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            if (silverDays < 20) objectivesFailed.push(`Giorni da Silver unlock: ${silverDays}/20`);
          } else if (targetTier === 'platinum') {
            if (stats.totalPartnerships < 75) objectivesFailed.push(`Partnership: ${stats.totalPartnerships}/75`);
            if (stats.activePartnerships < 30) objectivesFailed.push(`Partnership attive: ${stats.activePartnerships}/30`);
            if (accountAgeDays < 120) objectivesFailed.push(`Attività: ${accountAgeDays}/120 giorni`);
            if (stats.rejectedLast60Days > 0) objectivesFailed.push(`Rifiuti ultimi 60gg: ${stats.rejectedLast60Days}/0`);
            if (userEco.totalEarned < 5000) objectivesFailed.push(`Coins lifetime: ${userEco.totalEarned}/5000`);

            const goldDays = stats.goldUnlockedAt ? Math.floor((Date.now() - stats.goldUnlockedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            if (goldDays < 30) objectivesFailed.push(`Giorni da Gold unlock: ${goldDays}/30`);
          }

          if (objectivesFailed.length > 0) {
            return interaction.editReply(`❌ **Obiettivi Non Completati!**\n\n${objectivesFailed.map(o => `• ${o}`).join('\n')}\n\nCompleta tutti gli obiettivi prima di acquistare questo tier.`);
          }

          // All checks passed - unlock tier!
          userEco.balance -= cost;
          userEco.transactions.push({
            type: 'SPEND',
            amount: cost,
            reason: `Tier Upgrade: ${targetTier}`
          });
          await userEco.save();

          guildConfig.economy.tier = targetTier;
          guildConfig.economy.tierUnlockedAt = new Date();

          if (targetTier === 'silver') guildConfig.economy.tierStats.silverUnlockedAt = new Date();
          else if (targetTier === 'gold') guildConfig.economy.tierStats.goldUnlockedAt = new Date();

          await guildConfig.save();

          const tierEmojis = { silver: '🥈', gold: '🥇', platinum: '💎' };
          await interaction.editReply(`${tierEmojis[targetTier]} **TIER UPGRADE COMPLETATO!**\n\nSei ora **${targetTier.toUpperCase()}**!\nNuovi vantaggi sbloccati. Usa \`/stats\` per vederli!`);
        }
      }
      else {
        await interaction.editReply(`Azione non riconosciuta: ${action}`);
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Errore durante l\'esecuzione dell\'azione.');
    }
  }
}

module.exports = ButtonHandler;
