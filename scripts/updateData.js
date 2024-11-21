const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { formatISO } = require('date-fns');

console.log('Script started');

// Load environment variables
require('dotenv').config();
console.log('Environment variables loaded');

const APP_ID = process.env.APP_ID;
const API_KEY = process.env.API_KEY;

if (!APP_ID || !API_KEY) {
  console.error('Error: Missing API credentials.');
  process.exit(1);
}

// Load the list of artists
const artistsFilePath = path.join(__dirname, 'artists.json');
let artists = [];
try {
  const artistsData = fs.readFileSync(artistsFilePath, 'utf8');
  artists = JSON.parse(artistsData);
  console.log(`Loaded ${artists.length} artists from artists.json`);
} catch (error) {
  console.error('Error reading artists.json:', error.message);
  process.exit(1);
}

// Function to calculate date ranges
function calculateDateRanges() {
  const today = new Date();

  // Find the most recent Wednesday (Assuming script runs on Thursday)
  const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
  const daysSinceWednesday = (dayOfWeek + 4) % 7; // Number of days since last Wednesday
  const lastWednesday = new Date(today);
  lastWednesday.setDate(today.getDate() - daysSinceWednesday);

  // Week 2 (Last Week): From last Wednesday to last Wednesday +7 days
  const week2End = lastWednesday; // Last Wednesday (inclusive)
  const week2Start = new Date(week2End);
  week2Start.setDate(week2End.getDate() - 7); // 7 days before week2End

  // Week 1 (Previous Week): From week2Start to week2Start +7 days
  const week1End = week2Start; // Week before last Wednesday (exclusive)
  const week1Start = new Date(week1End);
  week1Start.setDate(week1End.getDate() - 7); // 7 days before week1End

  // Format dates to YYYY-MM-DD
  const dateRanges = {
    week1Start: formatISO(week1Start, { representation: 'date' }),
    week1End: formatISO(week1End, { representation: 'date' }),
    week2Start: formatISO(week2Start, { representation: 'date' }),
    week2End: formatISO(week2End, { representation: 'date' }),
  };

  return dateRanges;
}

// Function to read existing data.js
function readExistingData(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const existingData = fs.readFileSync(filePath, 'utf8');

      // Remove the 'const data = ' and ';' from the beginning and end
      const jsonData = existingData.replace(/^const data = /, '').replace(/;$/, '');

      return JSON.parse(jsonData);
    } catch (error) {
      console.error('Error reading data.js:', error.message);
      return [];
    }
  } else {
    // If data.js doesn't exist, return an empty array
    return [];
  }
}

// Function to write updated data.js
function writeData(filePath, data) {
  const jsContent = `const data = ${JSON.stringify(data, null, 2)};`;
  try {
    fs.writeFileSync(filePath, jsContent);
    console.log('Data successfully written to data.js');
  } catch (writeError) {
    console.error('Error writing to data.js:', writeError.message);
  }
}

// Function to fetch data for an artist
async function fetchDataForArtist(artist, dateRanges, existingArtistData) {
  const { uuid, name, imageUrl, high_level_genre, specific_genre } = artist;
  console.log(`Fetching data for artist: ${name} (UUID: ${uuid})`);

  // Construct API endpoint with date parameters
  const API_ENDPOINT = `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/streaming/spotify/listening?from=${dateRanges.week1Start}&to=${dateRanges.week2End}`;
  const API_HEADERS = {
    'x-app-id': APP_ID,
    'x-api-key': API_KEY,
  };

  try {
    const response = await fetch(API_ENDPOINT, { headers: API_HEADERS });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Check if 'items' exists in the response
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error(`Unexpected API response structure for ${name}: 'items' field is missing or not an array.`);
    }

    // Process data and calculate weekly listens
    const artistData = processData(artist, data.items, dateRanges, existingArtistData);
    console.log(`Processed data for ${name}`);

    return artistData;
  } catch (error) {
    console.error(`Error fetching data for ${name}:`, error.message);
    return null;
  }
}

// Function to process API data
function processData(artist, items, dateRanges, existingArtistData) {
  const { uuid, name, imageUrl, high_level_genre, specific_genre } = artist;

  // Define week boundaries
  const week1Start = new Date(dateRanges.week1Start);
  const week1End = new Date(dateRanges.week1End);
  const week2Start = new Date(dateRanges.week2Start);
  const week2End = new Date(dateRanges.week2End);

  let week1Total = 0;
  let week2Total = 0;

  items.forEach((item) => {
    const itemDate = new Date(item.date);
    if (itemDate >= week1Start && itemDate < week1End) {
      week1Total += item.value;
    } else if (itemDate >= week2Start && itemDate < week2End) {
      week2Total += item.value;
    }
  });

  const listensDifference = week2Total - week1Total;

  let artistData = existingArtistData || {
    artist: {
      uuid,
      name,
      imageUrl,
      high_level_genre,
      specific_genre,
    },
    weeks: [],
  };

  // Check if artist already has weeks data
  const hasExistingWeeks = artistData.weeks.length > 0;

  // Prepare new week data
  const newWeekData = {
    weekStartDate: dateRanges.week2Start,
    weekEndDate: dateRanges.week2End,
    totalListens: week2Total,
    listensDifference: null,
  };

  if (hasExistingWeeks) {
    // Calculate listensDifference based on last week's data
    const lastStoredWeek = artistData.weeks[artistData.weeks.length - 1];
    if (lastStoredWeek.totalListens !== undefined) {
      newWeekData.listensDifference = week2Total - lastStoredWeek.totalListens;
    }
  } else {
    // For new artists, include both weeks
    const previousWeekData = {
      weekStartDate: dateRanges.week1Start,
      weekEndDate: dateRanges.week1End,
      totalListens: week1Total,
    };
    artistData.weeks.push(previousWeekData);
    console.log(`Added previous week data for new artist: ${name}`);
    newWeekData.listensDifference = week2Total - week1Total;
  }

  // Check if the week data already exists to prevent duplicates
  const lastWeek = artistData.weeks[artistData.weeks.length - 1];
  if (lastWeek && lastWeek.weekStartDate === newWeekData.weekStartDate) {
    console.log(`Week data already exists for artist: ${name}`);
  } else {
    artistData.weeks.push(newWeekData);
    console.log(`Added new week data for artist: ${name}`);
  }

  return artistData;
}

// Main function to orchestrate data fetching and updating
async function fetchData() {
  console.log('Calculating date ranges...');
  const dateRanges = calculateDateRanges();
  console.log('Date ranges calculated:', dateRanges);

  console.log('Reading existing data from data.js');
  const dataFilePath = path.join(__dirname, '..', 'data.js');
  const existingData = readExistingData(dataFilePath);
  console.log(`Loaded ${existingData.length} existing artists from data.js`);

  console.log('Starting data fetch for all artists');
  const updatedData = [];

  for (const artist of artists) {
    const existingArtistData = existingData.find(a => a.artist.uuid === artist.uuid);
    const fetchedData = await fetchDataForArtist(artist, dateRanges, existingArtistData);
    if (fetchedData) {
      updatedData.push(fetchedData);
    }
  }

  console.log('Writing updated data to data.js');
  writeData(dataFilePath, updatedData);
}

// Execute the main function
(async () => {
  try {
    await fetchData();
    console.log('Script finished');
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
})();
