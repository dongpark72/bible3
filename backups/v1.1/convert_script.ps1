$mappingTxt = Get-Content -Path "mapping.txt" -Encoding UTF8
$mapping = @()
foreach ($line in $mappingTxt) {
    if ($line.Trim() -ne "") {
        $mapping += , ($line.Split(","))
    }
}

Write-Host "Loading bible.json..."
$rawJson = [System.IO.File]::ReadAllText("$(Get-Location)\bible.json", [System.Text.Encoding]::UTF8)
$data = $rawJson | ConvertFrom-Json

$books = @()

foreach ($pair in $mapping) {
    $korName = $pair[0].Trim()
    $engName = $pair[1].Trim()
    
    Write-Host "Processing $korName ($engName)..."
    
    $chaptersDict = @{}
    
    foreach ($property in $data.PSObject.Properties) {
        $key = $property.Name
        if ($key -match "^(.*?)([0-9]+):([0-9]+)$") {
            $kName = $matches[1]
            $chapStr = $matches[2]
            $verseStr = $matches[3]
            
            if ($kName -eq $korName) {
                $chapIdx = [int]$chapStr - 1
                $verseIdx = [int]$verseStr - 1
                
                if (-not $chaptersDict.ContainsKey($chapIdx)) {
                    $chaptersDict[$chapIdx] = @{}
                }
                $chaptersDict[$chapIdx][$verseIdx] = $property.Value.Trim()
            }
        }
    }
    
    $chaptersArr = @()
    $sortedChapterIndices = $chaptersDict.Keys | Sort-Object
    foreach ($cIdx in $sortedChapterIndices) {
        $versesDict = $chaptersDict[$cIdx]
        $sortedVerseIndices = $versesDict.Keys | Sort-Object
        
        $maxV = ($sortedVerseIndices | Measure-Object -Maximum).Maximum
        $verseList = @()
        for ($i = 0; $i -le $maxV; $i++) {
            if ($versesDict.ContainsKey($i)) {
                $verseList += $versesDict[$i]
            }
            else {
                $verseList += ""
            }
        }
        $chaptersArr += , ($verseList)
    }
    
    $bookObj = [PSCustomObject]@{
        abbrev   = $engName
        chapters = $chaptersArr
    }
    $books += $bookObj
}

Write-Host "Converting to JSON..."
$finalJson = $books | ConvertTo-Json -Depth 10 -Compress

Write-Host "Writing to data/bible_ko.json..."
[System.IO.File]::WriteAllText("$(Get-Location)\data\bible_ko.json", $finalJson, [System.Text.Encoding]::UTF8)
Write-Host "Conversion complete!"
