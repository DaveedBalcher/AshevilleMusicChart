const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// URL for the events page (adjust if necessary)
const url = 'https://www.bandsintown.com/this-week/genre/all-genres?city_id=4453066';

async function scrapeEvents() {
  try {
    // Fetch the HTML with headers to mimic a browser
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                      'Chrome/98.0.4758.102 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const $ = cheerio.load(html);
    const events = [];

    // Each event container appears to have the class "AtIvjk2YjzXSULT1cmVx"
    $('.AtIvjk2YjzXSULT1cmVx').each((i, element) => {
      // Extract the event name (first element with the event name class)
      const eventName = $(element)
        .find('div._5CQoAbgUFZI3p33kRVk')
        .first()
        .text()
        .trim();

      // Extract date and time from the element that holds the calendar info.
      // Example text format: "Feb 14 - 3:00 PM"
      const dateTimeText = $(element)
        .find('div.r593Wuo4miYix9siDdTP > div')
        .first()
        .text()
        .trim();
      let date = '', time = '';
      if (dateTimeText) {
        const parts = dateTimeText.split(' - ');
        if (parts.length >= 2) {
          date = parts[0].trim();
          time = parts[1].trim();
        }
      }

      // Extract TotalRSVPed from the element that holds the people icon and number.
      const totalRSVPed = $(element)
        .find('div.uemLS9AP30BLmy0YGHSY > div')
        .first()
        .text()
        .trim();

      // Only push the event if an event name is found
      if (eventName) {
        events.push({
          eventName,
          date,
          time,
          totalRSVPed
        });
      }
    });

    // Create an "events" folder if it doesn't exist
    const eventsDir = path.join(__dirname, 'events');
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir);
    }

    // Write the events data to a JSON file
    const filePath = path.join(eventsDir, 'events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));

    console.log('Events data saved successfully at:', filePath);
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

// Run the scraper
scrapeEvents();
