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

  // Week 1: From 16 days before today to 9 days before today
  const week1Start = new Date(today);
  week1Start.setDate(today.getDate() - 16);
  const week1End = new Date(today);
  week1End.setDate(today.getDate() - 9);

  // Week 2: From 8 days before today to 1 day before today
  const week2Start = new Date(today);
  week2Start.setDate(today.getDate() - 8);
  const week2End = new Date(today);
  week2End.setDate(today.getDate() - 1);

  // Format dates to YYYY-MM-DD
  const dateRanges = {
    week1Start: formatISO(week1Start, { representation: 'date' }),
    week1End: formatISO(week1End, { representation: 'date' }),
    week2Start: formatISO(week2Start, { representation: 'date' }),
    week2End: formatISO(week2End, { representation: 'date' }),
  };

  return dateRanges;
}

// Function to write updated data.js
function writeData(filePath, data) {
  const jsContent = `export const data = ${JSON.stringify(data, null, 2)};`;
  try {
    fs.writeFileSync(filePath, jsContent);
    console.log('Data successfully written to data.js');
  } catch (writeError) {
    console.error('Error writing to data.js:', writeError.message);
  }
}

function writeArchiveManifest(archiveDir) {
  const manifestPath = path.join(archiveDir, 'manifest.js');
  const files = fs
    .readdirSync(archiveDir)
    .filter(name => /^data_.+\.js$/.test(name))
    .sort((a, b) => b.localeCompare(a));

  const entries = files
    .map(name => `  { importPath: '../archive/${name}', filename: '${name}' }`)
    .join(',\n');

  const manifestContent = `export const archiveManifest = [\n${entries}\n];\n`;

  fs.writeFileSync(manifestPath, manifestContent);
  console.log('Archive manifest updated.');
}

// Function to fetch data for an artist
async function fetchDataForArtist(artist, dateRanges) {
  const { uuid, name, imageUrl, high_level_genre, specific_genre, spotifyUrl } = artist;
  console.log(`Fetching data for artist: ${name} (UUID: ${uuid})`);

  // Construct API endpoint with date parameters
  const API_ENDPOINT = `https://customer.api.soundcharts.com/api/v2/artist/${uuid}/streaming/spotify/listening?startDate=${dateRanges.week1Start}&endDate=${dateRanges.week2End}`;
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

    const itemDates = data.items.map((item) => item.date).sort();
    const earliestDate = itemDates[0];
    const latestDate = itemDates[itemDates.length - 1];
    const week1Window = `${dateRanges.week1Start} → ${dateRanges.week1End}`;
    const week2Window = `${dateRanges.week2Start} → ${dateRanges.week2End}`;

    const { week1Count, week2Count } = data.items.reduce(
      (accumulator, item) => {
        const itemDate = new Date(item.date);
        const week1Start = new Date(dateRanges.week1Start);
        const week1End = new Date(dateRanges.week1End);
        const week2Start = new Date(dateRanges.week2Start);
        const week2End = new Date(dateRanges.week2End);

        if (itemDate >= week1Start && itemDate < week1End) {
          accumulator.week1Count += 1;
        } else if (itemDate >= week2Start && itemDate < week2End) {
          accumulator.week2Count += 1;
        }

        return accumulator;
      },
      { week1Count: 0, week2Count: 0 }
    );

    console.log(
      `[${name}] received ${data.items.length} items (earliest: ${earliestDate}, latest: ${latestDate}); ` +
        `in-range counts — week1 (${week1Window}): ${week1Count}, week2 (${week2Window}): ${week2Count}`
    );

    // Process data and calculate weekly listens
    const artistData = processData(artist, data.items, dateRanges);
    console.log(`Processed data for ${name}`);

    return artistData;
  } catch (error) {
    console.error(`Error fetching data for ${name}:`, error.message);
    return null;
  }
}

// Function to process API data
function processData(artist, items, dateRanges) {
  const { uuid, name, imageUrl, high_level_genre, specific_genre, spotifyUrl } = artist;

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

  const artistData = {
    artist: {
      uuid,
      name,
      imageUrl,
      high_level_genre,
      specific_genre,
      spotifyUrl,
    },
    weeks: [
      {
        weekStartDate: dateRanges.week1Start,
        weekEndDate: dateRanges.week1End,
        totalListens: week1Total,
      },
      {
        weekStartDate: dateRanges.week2Start,
        weekEndDate: dateRanges.week2End,
        totalListens: week2Total,
        listensDifference,
      },
    ],
  };

  console.log(
    `[${name}] weekly totals — week1: ${week1Total} (${week1Start.toISOString().slice(0, 10)} → ${week1End.toISOString().slice(0, 10)}), ` +
      `week2: ${week2Total} (${week2Start.toISOString().slice(0, 10)} → ${week2End.toISOString().slice(0, 10)}), delta: ${listensDifference}`
  );

  return artistData;
}

// Main function to orchestrate data fetching and updating
async function fetchData() {
  console.log('Calculating date ranges...');
  const dateRanges = calculateDateRanges();
  console.log('Date ranges calculated:', dateRanges);

  console.log('Starting data fetch for all artists');
  const updatedData = [];

  for (const artist of artists) {
    const fetchedData = await fetchDataForArtist(artist, dateRanges);
    if (fetchedData) {
      updatedData.push(fetchedData);
    }
  }

  // Add a timestamp to the data
  const dataWithTimestamp = {
    timestamp: new Date().toISOString(),
    data: updatedData,
  };

  // Archive the existing data.js file
  const dataFilePath = path.join(__dirname, '..', 'data.js');
  const archiveDir = path.join(__dirname, '..', 'archive');

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
  }

  if (fs.existsSync(dataFilePath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveFilePath = path.join(archiveDir, `data_${timestamp}.js`);
    fs.renameSync(dataFilePath, archiveFilePath);
    console.log(`Archived previous data.js to ${archiveFilePath}`);
  }

  console.log('Writing updated data to data.js');
  writeData(dataFilePath, dataWithTimestamp);

  try {
    writeArchiveManifest(archiveDir);
  } catch (manifestError) {
    console.error('Failed to update archive manifest:', manifestError.message);
  }
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
