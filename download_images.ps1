$destDir = 'public\img\routers'
if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }

$content = Get-Content 'src\components\CompatibilityGrid.astro' -Raw
$matches = [regex]::Matches($content, 'slug:\s*"([^"]+)"')

foreach ($match in $matches) {
    $slug = $match.Groups[1].Value
    $dest = Join-Path $destDir ("{0}.webp" -f $slug)
    $url = "https://meshwg.pages.dev/img/routers/$slug.webp"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing
        Write-Host "Downloaded $slug.webp"
    } catch {
        Write-Host "Failed to download $slug.webp"
    }
}
