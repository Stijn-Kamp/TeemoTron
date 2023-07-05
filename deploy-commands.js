import fs from "node:fs";
import path from "node:path";
import discord from "discord.js";
import dotenv from "dotenv";
import { pathToFileURL } from "url";

dotenv.config();

import { __dirname } from "./constants.js";

const { REST, Routes } = discord;
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;

const commands = [];

// Grab all the command files from the commands directory you created earlier
const commandsFolder = "commands";
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

        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy the commands
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        // Use the put method to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // Catch and log any errors
        console.error(error);
    }
})();
