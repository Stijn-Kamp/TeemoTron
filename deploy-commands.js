import discord from "discord.js";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "url";
import { __dirname } from "./constants.js";

import config from "./config.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

const { REST, Routes } = discord;
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guilds = config.guilds;

async function getCommands(commandsFolder = "commands") {
    const commands = [];

    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(__dirname, commandsFolder);
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith(".js"));

        // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
        for (const file of commandFiles) {
            const filePath = pathToFileURL(path.join(folderPath, file));
            const command = await import(filePath);

            if (command.data && command.execute) {
                commands.push(command.data.toJSON());
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
        }
    }

    return commands;
}

function deployCommands(token, commands, clientId, guilds = []) {
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);

    // Deploy the commands
    (async () => {
        try {
            console.log(
                `Started refreshing ${commands.length} application (/) commands.`
            );

            // Use the put method to fully refresh all application commands
            rest.put(Routes.applicationCommands(clientId), {
                body: commands,
            }).then((data) => {
                console.log(
                    `Successfully reloaded ${data.length} application (/) commands.`
                );
            });

            // loop through each guild and deploy the commands
            if (!Array.isArray(guilds)) return;
            guilds.forEach((guildId) => {
                // Use the put method to fully refresh all commands in the guild with the current set
                rest.put(Routes.applicationGuildCommands(clientId, guildId), {
                    body: commands,
                }).then((data) => {
                    console.log(
                        `Successfully reloaded ${data.length} guild (/) commands.`
                    );
                });
            });
        } catch (error) {
            // Catch and log any errors
            console.error(error);
        }
    })();
}

getCommands().then((commands) => {
    deployCommands(token, commands, clientId, guilds);
});
