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
        // Format: shop_buy_boost_3d
        const subAction = id.split('_')[1]; // boost, reset
        const variant = id.split('_')[2]; // 3d, 1d, etc.

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!guildConfig) return interaction.editReply('❌ Configurazione server non trovata.');

        // Costi
        const costs = {
          'boost_3d': 500,
          'boost_1d': 200,
          'reset': 500
        };

        const itemKey = variant ? `${subAction}_${variant}` : subAction;
        const cost = costs[itemKey];

        if (!cost) return interaction.editReply('❌ Oggetto non riconosciuto.');

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
          guildConfig.serverProfile.lastPostDate = null; // Reset cooldown
          await guildConfig.save();
          await interaction.editReply('🔄 **Cooldown Resettato!** Puoi postare una nuova partnership immediatamente.');
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
