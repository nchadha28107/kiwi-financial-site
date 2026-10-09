# Discovers the official logo asset each lender publishes on its own site.
$ErrorActionPreference = 'Continue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$sites = [ordered]@{
    anz         = 'https://www.anz.co.nz/personal/'
    asb         = 'https://www.asb.co.nz/'
    bnz         = 'https://www.bnz.co.nz/'
    westpac     = 'https://www.westpac.co.nz/'
    kiwibank    = 'https://www.kiwibank.co.nz/'
    tsb         = 'https://www.tsb.co.nz/'
    sbs         = 'https://www.sbsbank.co.nz/'
    cooperative = 'https://www.co-operativebank.co.nz/'
    heartland   = 'https://www.heartland.co.nz/'
    icbc        = 'https://www.icbcnz.com/'
    boc         = 'https://www.bankofchina.com/nz/'
    resimac     = 'https://www.resimac.co.nz/'
}

$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

foreach ($k in $sites.Keys) {
    $url = $sites[$k]
    Write-Host "`n=== $k  ($url)"
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20 -Headers @{ 'User-Agent' = $ua }
        $html = $r.Content

        $hits = [System.Collections.Generic.List[string]]::new()
        foreach ($m in [regex]::Matches($html, '(?i)(?:src|href|content|data-src)\s*=\s*["'']([^"'']*logo[^"'']*)["'']')) {
            $hits.Add($m.Groups[1].Value)
        }
        foreach ($m in [regex]::Matches($html, '(?i)["'']([^"'']+\.svg)["'']')) {
            $hits.Add($m.Groups[1].Value)
        }
        $hits | Select-Object -Unique | Select-Object -First 8 | ForEach-Object { "   $_" }
        if ($hits.Count -eq 0) { Write-Host "   (no logo-ish asset found in markup)" }
    } catch {
        Write-Host "   FAILED: $($_.Exception.Message)"
    }
}
