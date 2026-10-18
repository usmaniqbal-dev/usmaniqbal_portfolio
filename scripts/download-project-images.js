const fs = require('fs');
const path = require('path');
const https = require('https');

const projects = [
  { id: 'salesforce-automation', photo: 'photo-1551288049-bebda4e38f71' },
  { id: 'real-estate-crm', photo: 'photo-1560518883-ce09059eeffa' },
  { id: 'student-application', photo: 'photo-1523240795612-9a054b0db644' },
  { id: 'capricorn-coffee', photo: 'photo-1501339847302-ac426a4a7cbb' },
  { id: 'ghl-funnel', photo: 'photo-1460925895917-afdab827c52f' },
  { id: 'nurax-crm', photo: 'photo-1618005182384-a83a8bd57fbe' },
  { id: 'salesforce-ecosystem', photo: 'photo-1451187580459-43490279c0fa' },
  { id: 'urdu-speech-pipeline', photo: 'photo-1598488035139-bdbb2231ce04' },
  { id: 'youtube-transcription', photo: 'photo-1516280440614-37939bbacd81' },
  { id: 'chatbot-ai', photo: 'photo-1677442136019-21780efad99a' },
  { id: 'urdu-voice-generator', photo: 'photo-1590602847861-f357a9332bbc' },
  { id: 'skin-cancer-detection', photo: 'photo-1579154204601-01588f351e67' },
  { id: 'tauric-trading-agents', photo: 'photo-1611974789855-9c2a0a7236a3' },
  { id: 'revenue-checker-ai', photo: 'photo-1554224155-6726b3ff858f' },
  { id: 'nuraxflow-ai', photo: 'photo-1504384308090-c894fdcc538d' },
  { id: 'usman-portfolio', photo: 'photo-1498050108023-c5249f4df085' },
  { id: 'nuraxtech-company', photo: 'photo-1497366216548-37526070297c' },
  { id: 'mian-rent-a-car', photo: 'photo-1503376780353-7e6692767b70' },
  { id: 'pet-tracking-care', photo: 'photo-1543466835-00a7907e9de1' },
  { id: 'neobank-app', photo: 'photo-1563986768609-322da13575f3' },
  { id: 'digital-store', photo: 'photo-1472851294608-062f824d29cc' },
  { id: 'fashiony-ogs', photo: 'photo-1490481651871-ab68de25d43d' },
  { id: 'pdf-text-converter', photo: 'photo-1568667256549-094345857637' },
  { id: 'pos-management', photo: 'photo-1556742049-0a67c5574f73' },
  { id: 'ai-voice-agent', photo: 'photo-1589254065878-42c9da997008' },
  { id: 'ai-chatbot-android', photo: 'photo-1512941937669-90a1b58e7e9c' },
  { id: 'custom-dashboards', photo: 'photo-1551836022-d5d88e9218df' },
  { id: 'portfolio-admin-panel', photo: 'photo-1555949963-ff9fe0c870eb' },
  { id: 'traffic-light-control', photo: 'photo-1506521781263-d8422e82f27a' },
  { id: 'food-donation-platform', photo: 'photo-1488521787991-ed7bbaae773c' },
  { id: 'library-management', photo: 'photo-1521587760476-6c12a4b040da' },
  { id: 'banking-management', photo: 'photo-1501167786227-4cba60f6d58f' },
  { id: 'student-management', photo: 'photo-1434030216411-0b793f4b4173' },
  { id: 'lifeproof-ai', photo: 'photo-1589829545856-d10d557cf95f' }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  const dir = path.join(__dirname, 'public', 'images', 'projects');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const item of projects) {
    const dest = path.join(dir, `${item.id}.jpg`);
    const url = `https://images.unsplash.com/${item.photo}?auto=format&fit=crop&w=720&q=80`;
    console.log(`Downloading ${item.id}...`);
    try {
      await download(url, dest);
      console.log(`Saved ${item.id}.jpg (${fs.statSync(dest).size} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${item.id}:`, e.message);
    }
  }
  console.log('Finished downloading all project images!');
}

run();
