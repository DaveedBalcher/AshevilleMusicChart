const functions = require('firebase-functions/v2');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

const TEST_ARTIST = {
  uuid: "11e83fe6-babe-ddde-a7ff-aa1c026db3d8",
  name: "Indigo De Souza"
};

async function fetchArtistData() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);
  
  const start = startDate.toISOString().split('T')[0];
  const end = today.toISOString().split('T')[0];

  const API_ENDPOINT = `https://customer.api.soundcharts.com/api/v2/artist/${TEST_ARTIST.uuid}/streaming/spotify/listening?from=${start}&to=${end}`;
  
  try {
    const response = await fetch(API_ENDPOINT, {
      headers: {
        'x-app-id': functions.params.defineString('SOUNDCHARTS_APP_ID'),
        'x-api-key': functions.params.defineString('SOUNDCHARTS_API_KEY'),
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new functions.https.HttpsError('invalid-argument', 
        `API request failed: ${response.status}`, errorText);
    }

    const data = await response.json();
    
    const artistData = {
      timestamp: new Date().toISOString(),
      artist: TEST_ARTIST,
      streamingData: data.items || [],
      period: { start, end }
    };

    await db.collection('artistData').doc('test').set(artistData);
    return artistData;

  } catch (error) {
    console.error('Error:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
}

exports.testFetch = functions.https.onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  retry: false,
  invoker: 'public',
}, async (req, res) => {
  try {
    const data = await fetchArtistData();
    res.json({success: true, data});
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      res.status(error.httpErrorCode).json({
        success: false,
        error: error.message,
        details: error.details
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});