import selenium from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import firefox from "selenium-webdriver/firefox.js";

const screen = {
    width: 640,
    height: 480,
};

const { Browser, Builder, By, Key, until } = selenium;

export async function createDriver() {
    const driver = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(new chrome.Options().headless().windowSize(screen))
        .setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
        .build();

    return driver;
}

export async function quitDriver(driver) {
    await driver.quit();
}
