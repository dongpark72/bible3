const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/ko_ko.json';
const dest = path.join(__dirname, 'data', 'bible_ko.json');

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download completed.');
    });
}).on('error', (err) => {
    fs.unlink(dest);
    console.error('Download error:', err.message);
});
