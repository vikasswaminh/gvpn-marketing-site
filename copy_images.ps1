$srcArcher = 'C:\Users\DELL 3511 (243597)\.gemini\antigravity-ide\brain\4b8e4948-e47d-4fa5-8aae-a05c5e501e37\cat_tplink_archer_1789117467618.png'
$srcDeco = 'C:\Users\DELL 3511 (243597)\.gemini\antigravity-ide\brain\4b8e4948-e47d-4fa5-8aae-a05c5e501e37\cat_tplink_deco_1789117505636.png'
$srcSmb = 'C:\Users\DELL 3511 (243597)\.gemini\antigravity-ide\brain\4b8e4948-e47d-4fa5-8aae-a05c5e501e37\cat_tplink_smb_1789117596210.png'
$srcHap = 'C:\Users\DELL 3511 (243597)\.gemini\antigravity-ide\brain\4b8e4948-e47d-4fa5-8aae-a05c5e501e37\cat_mikrotik_hap_1789117619197.png'
$srcRack = 'C:\Users\DELL 3511 (243597)\.gemini\antigravity-ide\brain\4b8e4948-e47d-4fa5-8aae-a05c5e501e37\cat_mikrotik_rack_1789117702573.png'

$destDir = 'public\img\routers'
$content = Get-Content 'src\components\CompatibilityGrid.astro' -Raw
$matches = [regex]::Matches($content, 'slug:\s*"([^"]+)"')

foreach ($match in $matches) {
    $slug = $match.Groups[1].Value
    $dest = Join-Path $destDir ("{0}.png" -f $slug)
    
    if (Test-Path $dest) { continue }
    
    $src = $null
    if ($slug -match 'archer|asus|synology|dream-router') { $src = $srcArcher }
    elseif ($slug -match 'deco') { $src = $srcDeco }
    elseif ($slug -match 'hap|chateau') { $src = $srcHap }
    elseif ($slug -match 'rack|ccr|rb4011|rb5009|pro|er-4|er-6p|er-8|8411') { $src = $srcRack }
    else { $src = $srcSmb }
    
    if ($src) {
        Copy-Item $src -Destination $dest -Force
    }
}
