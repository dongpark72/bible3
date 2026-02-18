$bookOrder = @(
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", 
    "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", 
    "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi", 
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", 
    "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
)
$abbrevMap = @{
    "Genesis" = "gn"; "Exodus" = "ex"; "Leviticus" = "lv"; "Numbers" = "nm"; "Deuteronomy" = "dt";
    "Joshua" = "js"; "Judges" = "jg"; "Ruth" = "rt"; "1 Samuel" = "1sm"; "2 Samuel" = "2sm";
    "1 Kings" = "1ki"; "2 Kings" = "2ki"; "1 Chronicles" = "1ch"; "2 Chronicles" = "2ch";
    "Ezra" = "ezr"; "Nehemiah" = "ne"; "Esther" = "et"; "Job" = "job"; "Psalms" = "ps";
    "Proverbs" = "prv"; "Ecclesiastes" = "ec"; "Song of Solomon" = "so"; "Isaiah" = "is";
    "Jeremiah" = "jr"; "Lamentations" = "lm"; "Ezekiel" = "ez"; "Daniel" = "dn";
    "Hosea" = "ho"; "Joel" = "jl"; "Amos" = "am"; "Obadiah" = "ob"; "Jonah" = "jn";
    "Micah" = "mi"; "Nahum" = "na"; "Habakkuk" = "hk"; "Zephaniah" = "zp"; "Haggai" = "hg";
    "Zechariah" = "zc"; "Malachi" = "ml"; "Matthew" = "mt"; "Mark" = "mk"; "Luke" = "lk";
    "John" = "jo"; "Acts" = "act"; "Romans" = "rm"; "1 Corinthians" = "1co"; "2 Corinthians" = "2co";
    "Galatians" = "gl"; "Ephesians" = "eph"; "Philippians" = "ph"; "Colossians" = "cl";
    "1 Thessalonians" = "1ts"; "2 Thessalonians" = "2ts"; "1 Timothy" = "1tm"; "2 Timothy" = "2tm";
    "Titus" = "tt"; "Philemon" = "phm"; "Hebrews" = "hb"; "James" = "jm"; "1 Peter" = "1pe";
    "2 Peter" = "2pe"; "1 John" = "1jo"; "2 John" = "2jo"; "3 John" = "3jo"; "Jude" = "jd";
    "Revelation" = "re"
}

function Convert-BibleVersion($rawFile, $outputFile) {
    if (-not (Test-Path $rawFile)) {
        Write-Host "File not found: $rawFile"
        return
    }
    Write-Host "Converting $rawFile..."
    $raw = Get-Content -Raw -Path $rawFile | ConvertFrom-Json
    $converted = @()
    foreach ($bookName in $bookOrder) {
        if ($raw.$bookName) {
            $bookData = $raw.$bookName
            $chapters = @()
            # In some JSONs, keys might be strings, ensure numeric sort
            $sortedChapterKeys = $bookData.psobject.properties.name | Sort-Object { [int]$_ }
            foreach ($chKey in $sortedChapterKeys) {
                $chapterData = $bookData.$chKey
                $verses = @()
                $sortedVerseKeys = $chapterData.psobject.properties.name | Sort-Object { [int]$_ }
                foreach ($vKey in $sortedVerseKeys) {
                    $verses += $chapterData.$vKey
                }
                $chapters += , $verses
            }
            $converted += [PSCustomObject]@{
                abbrev   = if ($abbrevMap[$bookName]) { $abbrevMap[$bookName] } else { $bookName.ToLower().Substring(0, 2) }
                chapters = $chapters
                name     = $bookName
            }
        }
    }
    $converted | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding utf8
    Write-Host "Done: $outputFile"
}

Convert-BibleVersion "data/niv_raw.json" "data/bible_en_niv.json"
Convert-BibleVersion "data/nlt_raw.json" "data/bible_en_nlt.json"
Convert-BibleVersion "data/esv_raw.json" "data/bible_en_esv.json"
