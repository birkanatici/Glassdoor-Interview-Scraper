const {Builder, By, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

// User PARAMS
const interviewPageUrl = `https://www.glassdoor.com/Interview/Uber-Engineering-Interview-Questions-EI_IE575263.0,4_DEPT1007.htm`;
const companyName = 'Uber';
const email = process.env.GLASSDOOR_EMAIL;
const password = process.env.GLASSDOOR_PASSWORD;
const MAX_PAGE_SIZE = 100;

// Define constants for CSS selectors
const BASE_URL = `https://www.glassdoor.com`;
const LOGIN_URL = `${BASE_URL}/profile/login_input.htm`;
const EMAIL_INPUT_SELECTOR = By.id('inlineUserEmail');
const EMAIL_CONTINUE_SELECTOR = By.css('[data-testid="email-form-button"]');
const PASSWORD_INPUT_SELECTOR = By.name('password');
const SIGN_IN_BUTTON_SELECTOR = By.css('button[name="submit"]');
const INTERVIEW_EXPERIENCE_SELECTOR = By.css("[data-test='InterviewList'] > [data-test*='Container']");
const INTERVIEW_TITLE_SELECTOR = By.css('[data-test$="Title"]');
const INTERVIEW_DATE_SELECTOR = By.css('[data-test$="Topline"]');
const INTERVIEW_RATING_SELECTOR = By.css('[data-test$="Rating"]');
const APPLICATION_DETAILS_SELECTOR = By.css('[data-test$="ApplicationDetails"] p');
const INTERVIEW_PROCESS_SELECTOR = By.css('[data-test$="Process"]');
const INTERVIEW_QUESTIONS_SELECTOR = By.css('[data-test$="Questions"] span');
const NEXT_PAGE_BUTTON_SELECTOR = By.css('[data-test="pagination-next"]');
const ACCEPT_COOKIES_BUTTON_SELECTOR = By.id("onetrust-accept-btn-handler");

// Set up Selenium driver with options
async function setupDriver() {
  const options = new chrome.Options();

  options.addArguments('--disable-extensions');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-infobars');
  options.addArguments('--disable-notifications');

  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function clickAcceptCookiesButton(driver) {
  try {
    await driver.wait(until.elementLocated(EMAIL_INPUT_SELECTOR));
    await driver.findElement(ACCEPT_COOKIES_BUTTON_SELECTOR).click();
  } catch (error) {
    //pass
  }
}

// Login to Glassdoor with provided credentials
async function login(driver, email, password) {
  await driver.get(LOGIN_URL);
  await driver.sleep(2000);

  await clickAcceptCookiesButton(driver);

  await driver.wait(until.elementLocated(EMAIL_INPUT_SELECTOR));
  await driver.wait(until.elementLocated(EMAIL_CONTINUE_SELECTOR));

  const emailInput = await driver.findElement(EMAIL_INPUT_SELECTOR);
  await emailInput.sendKeys(email);

  const emailContinueButton = await driver.findElement(EMAIL_CONTINUE_SELECTOR);

  await emailContinueButton.click();

  await driver.sleep(2000);

  await driver.wait(until.elementLocated(PASSWORD_INPUT_SELECTOR));
  await driver.wait(until.elementLocated(SIGN_IN_BUTTON_SELECTOR));

  const passwordInput = await driver.findElement(PASSWORD_INPUT_SELECTOR);
  await passwordInput.sendKeys(password);

  const signInButton = await driver.findElement(SIGN_IN_BUTTON_SELECTOR);
  await signInButton.click();

  await driver.sleep(2000);
}

async function waitUntilNextPageButtonAppeared(driver) {
  const timeoutMillis = 5000; // 5 seconds
  await driver.wait(until.elementLocated(NEXT_PAGE_BUTTON_SELECTOR), timeoutMillis)
    .catch(async (error) => {
        console.log(`error occurred :${error}, refreshing page...`);
        await driver.navigate().refresh();
        await driver.sleep(timeoutMillis); // Add sleep to allow page to load after refresh
      }
    );
}

async function extractExperience(section) {
  const title = await section.findElement(INTERVIEW_TITLE_SELECTOR).getText();
  const date = await section.findElement(INTERVIEW_DATE_SELECTOR).getText();
  const ratings = await section.findElements(INTERVIEW_RATING_SELECTOR);

  const offer = ratings.length > 0 ? await ratings[0].getText() : '';
  const experience = ratings.length > 1 ? await ratings[1].getText() : '';
  const difficulty = ratings.length > 2 ? await ratings[2].getText() : '';

  const applicationDetails = await section.findElement(APPLICATION_DETAILS_SELECTOR).getText();
  const process = await section.findElement(INTERVIEW_PROCESS_SELECTOR).getText();
  const questions = await section.findElements(INTERVIEW_QUESTIONS_SELECTOR);
  const questionList = await Promise.all(questions.map(q => q.getText()));

  return {
    title,
    date,
    offer,
    experience,
    difficulty,
    applicationDetails,
    process,
    questions: questionList
  };
}

// Scrape interview experiences for a given company
async function scrapeInterviewExperiences(driver, interviewPageUrl) {
  const interviewExperiences = [];

  await driver.get(interviewPageUrl);

  for (let index = 0; index < MAX_PAGE_SIZE; index++) {
    console.log(`page: ${index}`);

    await driver.sleep(2000);
    await driver.wait(until.elementLocated(INTERVIEW_EXPERIENCE_SELECTOR));
    const interviewSections = await driver.findElements(INTERVIEW_EXPERIENCE_SELECTOR);

    for (const section of interviewSections) {
      await extractExperience(section)
        .then(items => interviewExperiences.push(items))
        .catch(error => console.log(`Error scraping interview experience: ${error}`));
    }

    await waitUntilNextPageButtonAppeared(driver);

    const nextPage = await driver.findElement(NEXT_PAGE_BUTTON_SELECTOR);

    const hasNextPage = await nextPage.isEnabled();
    if (!hasNextPage) break;

    await nextPage.click();
  }

  console.log(interviewExperiences);

  return interviewExperiences;
}

function writeToJSONFile(interviewExperiences) {
  fs.writeFileSync(`${companyName}-${new Date().toISOString()}.json`, JSON.stringify(interviewExperiences));
}

async function run() {
  const driver = await setupDriver();
  await login(driver, email, password);

  scrapeInterviewExperiences(driver, interviewPageUrl)
    .then(interviewExperiences => writeToJSONFile(interviewExperiences))
    .catch(error => console.error(error))
}

run().catch(error => console.log(error));

