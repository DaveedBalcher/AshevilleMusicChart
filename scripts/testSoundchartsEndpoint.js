const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { formatISO } = require('date-fns');

require('dotenv').config();

const APP_ID = process.env.APP_ID;
const API_KEY = process.env.API_KEY;

if (!APP_ID || !API_KEY) {
  console.error('Missing APP_ID or API_KEY environment variables.');
  process.exit(1);
}

const artistsPath = path.join(__dirname, 'artists.json');
const artists = JSON.parse(fs.readFileSync(artistsPath, 'utf8'));

if (!Array.isArray(artists) || artists.length === 0) {
  console.error('No artists found in artists.json.');
  process.exit(1);
}

const [artist] = artists;

function previewSecret(secret) {
  if (!secret) return 'unset';
  if (secret.length <= 6) return `${secret.slice(0, 2)}…`;
  return `${secret.slice(0, 3)}…${secret.slice(-3)}`;
}

function calculateDateRanges() {
  const today = new Date();

  const week1Start = new Date(today);
  week1Start.setDate(today.getDate() - 16);
  const week1End = new Date(today);
  week1End.setDate(today.getDate() - 9);

  const week2Start = new Date(today);
  week2Start.setDate(today.getDate() - 8);
  const week2End = new Date(today);
  week2End.setDate(today.getDate() - 1);

  return {
    week1Start: formatISO(week1Start, { representation: 'date' }),
    week1End: formatISO(week1End, { representation: 'date' }),
    week2Start: formatISO(week2Start, { representation: 'date' }),
    week2End: formatISO(week2End, { representation: 'date' }),
  };
}

async function testEndpoint() {
  const dateRanges = calculateDateRanges();
  console.log(`Testing Soundcharts endpoint for ${artist.name} (uuid: ${artist.uuid})`);
  console.log('Date ranges:', dateRanges);
  console.log('Auth preview:', {
    APP_ID: previewSecret(APP_ID),
    API_KEY: previewSecret(API_KEY),
  });

  const API_ENDPOINT = `https://customer.api.soundcharts.com/api/v2/artist/${artist.uuid}/streaming/spotify/listening?startDate=${dateRanges.week1Start}&endDate=${dateRanges.week2End}`;
  const API_HEADERS = {
    'x-app-id': APP_ID,
    'x-api-key': API_KEY,
  };

  console.log('Requesting endpoint:', API_ENDPOINT);

  const response = await fetch(API_ENDPOINT, { headers: API_HEADERS });
  console.log('Response status:', response.status, response.statusText);
  console.log('Response headers (selected):', {
    'content-type': response.headers.get('content-type'),
    'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
    'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
    'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
    'retry-after': response.headers.get('retry-after'),
  });
  if (!response.ok) {
    console.error(`API request failed with status ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  const data = await response.json();

  if (!data.items || !Array.isArray(data.items)) {
    console.error('Unexpected API response: missing items array.', {
      keys: Object.keys(data || {}),
    });
    process.exit(1);
  }

  if (data.items.length === 0) {
    console.error('API returned zero items for the first artist.', {
      rawData: data,
    });
    process.exit(1);
  }

  const totalListens = data.items.reduce((sum, item) => sum + (item.value || 0), 0);
  console.log(`Received ${data.items.length} items totaling ${totalListens} listens for ${artist.name}.`);

  const sampleItems = data.items.slice(0, 5).map((item) => ({
    date: item.date,
    value: item.value,
    region: item.region,
    source: item.source,
  }));
  console.log('Sample items (up to 5):', sampleItems);
}

(async () => {
  try {
    await testEndpoint();
  } catch (error) {
    console.error('Unexpected error while testing endpoint:', error);
    process.exit(1);
  }
})();
