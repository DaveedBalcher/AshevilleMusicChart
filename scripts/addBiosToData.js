const fs = require('fs');
const path = require('path');

console.log('Adding bio fields to data.js...');

// Read artists.json
const artistsPath = path.join(__dirname, 'artists.json');
const artistsData = JSON.parse(fs.readFileSync(artistsPath, 'utf8'));

// Create a map of uuid to bio fields
const bioMap = new Map();
artistsData.forEach(artist => {
  bioMap.set(artist.uuid, {
    concise_bio: artist.concise_bio,
    detailed_bio: artist.detailed_bio
  });
});

console.log(`Loaded bios for ${bioMap.size} artists`);

// Read current data.js
const dataPath = path.join(__dirname, '..', 'data.js');
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract the data object (remove 'export const data = ' and parse JSON)
const jsonStart = dataContent.indexOf('{');
const jsonEnd = dataContent.lastIndexOf('}') + 1;
const jsonString = dataContent.substring(jsonStart, jsonEnd);
const currentData = JSON.parse(jsonString);

// Add bio fields to each artist
currentData.data.forEach(entry => {
  const uuid = entry.artist.uuid;
  const bio = bioMap.get(uuid);
  if (bio) {
    entry.artist.concise_bio = bio.concise_bio;
    entry.artist.detailed_bio = bio.detailed_bio;
  }
});

// Write back to data.js
const newContent = `export const data = ${JSON.stringify(currentData, null, 2)};
`;
fs.writeFileSync(dataPath, newContent, 'utf8');

console.log('✓ Successfully added bio fields to data.js');
console.log(`  Updated ${currentData.data.length} artist entries`);
