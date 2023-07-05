import fetch from "node-fetch";
import selenium from "selenium-webdriver";
const { Builder, By, Key, until } = selenium;

async function getSummonerInfo(region, summonerName) {
    const driver = await new Builder().forBrowser("chrome").build();
    const url = `https://www.op.gg/summoners/${region}/${summonerName}`;

    try {
        // Navigate to the page
        await driver.get(url);

        // Wait for the page to load
        await driver.wait(
            until.elementLocated(By.css(".css-1v663t.e1x14w4w1")),
            5000
        );

        // Scrape the data
        const rankSolo = await driver
            .findElement(By.css(".css-1v663t.e1x14w4w1 .tier"))
            .getText();
        return {
            rankSolo,
        };
    } catch (err) {
        console.error(err);
    } finally {
        // Close the browser
        await driver.quit();
    }
}

async function main() {
    const summonerInfo = await getSummonerInfo("euw", "Annénas");
    console.log(summonerInfo);
}

main();
