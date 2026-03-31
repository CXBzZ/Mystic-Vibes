import https from 'https';

const url = 'https://raw.githubusercontent.com/fogleman/Tarot/master/images/maj00.jpg';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  console.log(`Status: ${res.statusCode}`);
});
