import discord from "discord.js";
const { SlashCommandBuilder, EmbedBuilder } = discord;

import { fileURLToPath } from "url";

import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const screen = {
    width: 640,
    height: 480,
};

const { Browser, Builder, By, Key, until } = selenium;

function convertToTimestamp(sentence) {
    const lowercaseSentence = sentence.toLowerCase();
    const now = Date.now();
    const match = lowercaseSentence.match(/\d+/);

    if (lowercaseSentence.includes("seconds ago")) {
        if (match) {
            const secondsAgo = parseInt(match[0]);
            return now - secondsAgo * 1000;
        }
    }

    if (lowercaseSentence.includes("minutes ago")) {
        if (match) {
            const minutesAgo = parseInt(match[0]);
            return now - minutesAgo * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("hours ago")) {
        if (match) {
            const hoursAgo = parseInt(match[0]);
            return now - hoursAgo * 60 * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("days ago")) {
        if (match) {
            const daysAgo = parseInt(match[0]);
            return now - daysAgo * 24 * 60 * 60 * 1000;
        }
    }

    if (lowercaseSentence.includes("months ago")) {
        if (match) {
            const monthsAgo = parseInt(match[0]);
            const date = new Date(now);
            date.setMonth(date.getMonth() - monthsAgo);
            return date.getTime();
        }
    }

    // If the sentence doesn't match any of the expected formats, return now
    return now;
}

async function getSummonerInfo(region, summonerName) {
    if (!region) {
        region = "euw";
    }
    summonerName = summonerName.replace(" ", "+");

    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(new chrome.Options().headless().windowSize(screen))
        .build();

    const baseUrl = "https://www.op.gg";
    const url = `${baseUrl}/summoners/${region}/${summonerName}`;

    try {
        // Navigate to the page
        await driver.get(url);

        // Wait for the page to load
        await driver.wait(until.elementLocated(By.className("content")), 5000);

        const title = "OP.GG";
        const logo = await driver
            .findElement(By.css("img[alt*='OP.GG logo']"))
            .getAttribute("src");
        const description = await driver
            .findElement(By.className("header-info"))
            .getText();
        const footer = await driver.findElement(By.css("small")).getText();

        const website = {
            baseUrl,
            url,
            logo,
            title,
            description,
            footer,
        };

        const contentHeader = await driver.findElement(By.id("content-header"));
        const contentContainer = await driver.findElement(
            By.id("content-container")
        );

        // Extract the data from the element
        const profileName = await contentHeader
            .findElement(By.className("summoner-name"))
            .getText();
        const profileIcon = await contentHeader
            .findElement(By.className("profile-icon"))
            .findElement(By.css("img"))
            .getAttribute("src");
        const level = await contentHeader
            .findElement(By.css(".level .level"))
            .getText();
        const previousTier = await contentHeader
            .findElement(By.css(".prev-tier div"))
            .getText();
        const ladderRank = await contentHeader
            .findElement(By.css(".ranking"))
            .getText();
        var lastUpdated = await contentHeader
            .findElement(By.css(".last-update div"))
            .getText();
        lastUpdated = convertToTimestamp(lastUpdated);

        const header = {
            profileName,
            profileIcon,
            level,
            previousTier,
            ladderRank,
            lastUpdated,
        };

        const rankedSoloHeader = await contentContainer
            .findElement(By.css(".header"))
            .getText();
        const rankedSoloTier = await contentContainer
            .findElement(By.css(".tier"))
            .getText();
        const rankedSoloLP = await contentContainer
            .findElement(By.css(".lp"))
            .getText();
        const rankedSoloWinLose = await contentContainer
            .findElement(By.css(".win-lose"))
            .getText();
        const rankedSoloWinRate = await contentContainer
            .findElement(By.css(".ratio"))
            .getText();

        const rankedFlexHeader = await contentContainer
            .findElement(By.css(".header"))
            .getText();
        const rankedFlexStatusElement = await contentContainer.findElement(
            By.css(".unranked")
        );
        const rankedFlexStatus = await rankedFlexStatusElement.getText();

        const champions = [];
        const championBoxes = await contentContainer.findElements(
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
            website,
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
        website: { baseUrl, url, logo, title, description, footer },
        header: {
            profileName,
            profileIcon,
            level,
            previousTier,
            ladderRank,
            lastUpdated,
        },
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
        .setTitle(profileName)
        .setThumbnail(profileIcon)
        .setURL(url)
        .setAuthor({
            name: title,
            iconURL: logo,
            url: baseUrl,
        })
        .setDescription("Player profile from OP.GG")
        .addFields(
            { name: "Level", value: level },
            { name: "Previous Tier", value: previousTier },
            { name: "Ladder Rank", value: ladderRank },
            { name: "Tier", value: rankedSoloTier },
            { name: "LP", value: rankedSoloLP },
            { name: "Win/Loss", value: rankedSoloWinLose },
            { name: "Win Rate", value: rankedSoloWinRate },
            { name: "Ranked Flex", value: rankedFlexStatus }
        )
        .setTimestamp(lastUpdated)
        .setFooter({
            text: title,
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
    .setDescription("Retrieves summoner info from op.gg")
    .addStringOption((option) =>
        option
            .setName("summonername")
            .setDescription("The name of the summoner")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("server")
            .setDescription("The server the summoner is on")
            .addChoices(
                { name: "EUW", value: "euw" },
                { name: "EUNE", value: "eune" },
                { name: "NA", value: "na" },
                { name: "KR", value: "kr" },
                { name: "JP", value: "jp" },
                { name: "OCE", value: "oce" }
            )
    );

export const execute = async (interaction) => {
    await interaction.deferReply();
    const server = interaction.options.getString("server");
    const summonerName = interaction.options.getString("summonername");

    getSummonerInfo(server, summonerName)
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
