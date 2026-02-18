const fs = require('fs');
const path = require('path');

const bookOrder = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
    "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
    "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const abbrevMap = {
    "Genesis": "gn", "Exodus": "ex", "Leviticus": "lv", "Numbers": "nm", "Deuteronomy": "dt",
    "Joshua": "js", "Judges": "jg", "Ruth": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
    "1 Kings": "1ki", "2 Kings": "2ki", "1 Chronicles": "1ch", "2 Chronicles": "2ch",
    "Ezra": "ezr", "Nehemiah": "ne", "Esther": "et", "Job": "job", "Psalms": "ps",
    "Proverbs": "prv", "Ecclesiastes": "ec", "Song of Solomon": "so", "Isaiah": "is",
    "Jeremiah": "jr", "Lamentations": "lm", "Ezekiel": "ez", "Daniel": "dn",
    "Hosea": "ho", "Joel": "jl", "Amos": "am", "Obadiah": "ob", "Jonah": "jn",
    "Micah": "mi", "Nahum": "na", "Habakkuk": "hk", "Zephaniah": "zp", "Haggai": "hg",
    "Zechariah": "zc", "Malachi": "ml", "Matthew": "mt", "Mark": "mk", "Luke": "lk",
    "John": "jo", "Acts": "act", "Romans": "rm", "1 Corinthians": "1co", "2 Corinthians": "2co",
    "Galatians": "gl", "Ephesians": "eph", "Philippians": "ph", "Colossians": "cl",
    "1 Thessalonians": "1ts", "2 Thessalonians": "2ts", "1 Timothy": "1tm", "2 Timothy": "2tm",
    "Titus": "tt", "Philemon": "phm", "Hebrews": "hb", "James": "jm", "1 Peter": "1pe",
    "2 Peter": "2pe", "1 John": "1jo", "2 John": "2jo", "3 John": "3jo", "Jude": "jd",
    "Revelation": "re"
};

function convert(rawFile, outputFile) {
    if (!fs.existsSync(rawFile)) {
        console.log(`File not found: ${rawFile}`);
        return;
    }
    console.log(`Converting ${rawFile}...`);
    const raw = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
    const converted = [];

    for (const bookName of bookOrder) {
        if (raw[bookName]) {
            const bookData = raw[bookName];
            const chapters = [];
            const sortedChapterKeys = Object.keys(bookData).sort((a, b) => parseInt(a) - parseInt(b));

            for (const chKey of sortedChapterKeys) {
                const chapterData = bookData[chKey];
                const verses = [];
                const sortedVerseKeys = Object.keys(chapterData).sort((a, b) => parseInt(a) - parseInt(b));

                for (const vKey of sortedVerseKeys) {
                    verses.push(chapterData[vKey]);
                }
                chapters.push(verses);
            }

            converted.push({
                abbrev: abbrevMap[bookName] || bookName.toLowerCase().substring(0, 2),
                chapters: chapters,
                name: bookName
            });
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(converted));
    console.log(`Saved to ${outputFile}`);
}

convert('niv_raw.json', 'bible_en_niv.json');
convert('nlt_raw.json', 'bible_en_nlt.json');
convert('esv_raw.json', 'bible_en_esv.json');
