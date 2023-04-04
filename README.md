## Glassdoor Interview Experience Scraper

This is a Node.js script that uses Selenium-Webdriver to scrape interview experiences from the Glassdoor website for a specific company. The script logs in to Glassdoor with provided credentials, navigates to the interview page of the target company, and extracts interview experiences including interview titles, dates, ratings, application details, interview process, and interview questions. The script also handles pagination and waits for elements to load before proceeding.

### Prerequisites
- Node.js installed on your machine
- npm (Node Package Manager) installed on your machine
- Chrome browser installed on your machine

### Installation
1. Clone the repository to your local machine.
2. Navigate to the cloned directory in your terminal.
3. Run npm install to install the required dependencies (`selenium-webdriver` and `selenium-webdriver/chrome`).
4. Make sure to set the following environment variables:
   - `GLASSDOOR_EMAIL`: Your Glassdoor email address.
   - `GLASSDOOR_PASSWORD`: Your Glassdoor password.

### Usage
You can configure the following parameters in the script to customize your scraping:

- `interviewPageUrl`: The URL of the interview page for the target company on Glassdoor.
- `companyName`: The name of the target company.
- `email`: Your Glassdoor email address.
- `password`: Your Glassdoor password.
- `MAX_PAGE_SIZE`: The maximum number of pages to scrape (default is 100).

To run the script, execute the following command in your terminal:

```shell
node glassdoor-scraper.js
```

The script will log in to Glassdoor with your provided credentials, navigate to the interview page of the target company, and start scraping interview experiences. The extracted data will be stored in an array of objects, where each object represents an interview experience with details such as interview title, date, ratings, application details, interview process, and interview questions.

### Note: 
The script uses a Chrome browser with Selenium-Webdriver, so you might see a Chrome window opening during the execution of the script.

### License
This script is licensed under the MIT License. Feel free to use and modify it according to your needs. However, please note that web scraping may be subject to legal restrictions and terms of use of websites. Make sure to review and comply with the terms of use of Glassdoor or any other website you intend to scrape. The authors of this script are not responsible for any misuse or legal issues arising from the use of this script. Use it at your own risk. Happy scraping! 🚀🔍📝

