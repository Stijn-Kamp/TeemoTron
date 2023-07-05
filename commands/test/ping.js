// Desc: Replies with Pong!

import discord from "discord.js";
const { SlashCommandBuilder } = discord;

export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

export const execute = async (interaction) => {
    await interaction.reply("Pong!");
};
