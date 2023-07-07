import discord from "discord.js";
const { SlashCommandBuilder, EmbedBuilder } = discord;

import { fileURLToPath } from "url";

import selenium from "selenium-webdriver";

const { Browser, Builder, By, Key, until } = selenium;

async function getSummonerInfo(region, summonerName) {
    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(/* ... */)
        .build();
    const url = `https://www.op.gg/summoners/${region}/${summonerName}`;

    try {
        // Navigate to the page
        await driver.get(url);

        // Wait for the page to load
        await driver.wait(until.elementLocated(By.className("content")), 5000);

        const contentHeader = await driver.findElement(By.id("content-header"));
        const contentContainer = await driver.findElement(
            By.id("content-container")
        );

        // Extract the data from the element
        const profileName = await contentHeader
            .findElement(By.className("summoner-name"))
            .getText();
        const level = await contentHeader
            .findElement(By.css(".level .level"))
            .getText();
        const previousTier = await contentHeader
            .findElement(By.css(".prev-tier div"))
            .getText();
        const ladderRank = await contentHeader
            .findElement(By.css(".ranking"))
            .getText();
        const lastUpdated = await contentHeader
            .findElement(By.css(".last-update div"))
            .getText();

        const header = {
            profileName,
            level,
            previousTier,
            ladderRank,
            lastUpdated,
        };

        const rankedSoloHeader = await driver
            .findElement(By.css(".header"))
            .getText();
        const rankedSoloTier = await driver
            .findElement(By.css(".tier"))
            .getText();
        const rankedSoloLP = await driver.findElement(By.css(".lp")).getText();
        const rankedSoloWinLose = await driver
            .findElement(By.css(".win-lose"))
            .getText();
        const rankedSoloWinRate = await driver
            .findElement(By.css(".ratio"))
            .getText();

        const rankedFlexHeader = await driver
            .findElement(By.css(".header"))
            .getText();
        const rankedFlexStatusElement = await driver.findElement(
            By.css(".unranked")
        );
        const rankedFlexStatus = await rankedFlexStatusElement.getText();

        const champions = [];
        const championBoxes = await driver.findElements(
            By.css(".champion-box")
        );
        for (const championBox of championBoxes) {
            const championName = await championBox
                .findElement(By.css(".name"))
                .getText();
            const championCS = await championBox
                .findElement(By.css(".cs"))
                .getText();
            const championKDA = await championBox
                .findElement(By.css(".kda .detail"))
                .getText();
            const championPlayed = await championBox
                .findElement(By.css(".played .count"))
                .getText();

            champions.push({
                name: championName,
                cs: championCS,
                kda: championKDA,
                played: championPlayed,
            });
        }

        const container = {
            rankedSoloHeader,
            rankedSoloTier,
            rankedSoloLP,
            rankedSoloWinLose,
            rankedSoloWinRate,
            rankedFlexHeader,
            rankedFlexStatus,
            champions,
        };

        return {
            header,
            container,
        };
    } catch (err) {
        console.error(err);
    } finally {
        // Close the browser
        await driver.quit();
    }
}

function createProfileEmbed(profileData) {
    // Extract profile information
    const {
        header: { profileName, level, previousTier, ladderRank, lastUpdated },
        container: {
            rankedSoloHeader,
            rankedSoloTier,
            rankedSoloLP,
            rankedSoloWinLose,
            rankedSoloWinRate,
            rankedFlexHeader,
            rankedFlexStatus,
            champions,
        },
    } = profileData;

    // Create a new embed
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Player Profile")
        .setURL("https://discord.js.org/")
        .setAuthor({
            name: profileName,
            iconURL: "https://i.imgur.com/AfFp7pu.png",
            url: "https://discord.js.org",
        })
        .setDescription("Some description here")
        .setThumbnail("https://i.imgur.com/AfFp7pu.png")
        .addFields(
            { name: "Profile Name", value: profileName },
            { name: "Level", value: level },
            { name: "Previous Tier", value: previousTier },
            { name: "Ladder Rank", value: ladderRank },
            { name: "Last Updated", value: lastUpdated },
            { name: "Ranked Solo", value: rankedSoloHeader },
            { name: "Tier", value: rankedSoloTier },
            { name: "LP", value: rankedSoloLP },
            { name: "Win/Loss", value: rankedSoloWinLose },
            { name: "Win Rate", value: rankedSoloWinRate },
            { name: "Ranked Flex", value: rankedFlexHeader },
            { name: "Status", value: rankedFlexStatus }
        )
        .setImage("https://i.imgur.com/AfFp7pu.png")
        .setTimestamp()
        .setFooter({
            text: "Some footer text here",
            iconURL: "https://i.imgur.com/AfFp7pu.png",
        });

    return embed;
}

async function main() {
    getSummonerInfo("euw", "Mucho Bungo").then((summonerInfo) => {
        console.log(summonerInfo);
        const embedMessage = createProfileEmbed(summonerInfo);
        console.log(embedMessage);
    });
}

export const data = new SlashCommandBuilder()
    .setName("opgg")
    .setDescription("Retrieves summoner info from op.gg");

export const execute = async (interaction) => {
    await interaction.deferReply();
    getSummonerInfo("euw", "Annénas")
        .then((summonerInfo) => {
            if (summonerInfo) {
                const embedMessage = createProfileEmbed(summonerInfo);
                return interaction.editReply({ embeds: [embedMessage] });
            }
            return interaction.editReply("Summoner not found");
        })
        .catch((err) => {
            return interaction.editReply("Error: " + err);
        });
};

// only run the code if this file is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
