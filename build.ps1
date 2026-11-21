# JNUS website build
# Assembles src/pages/*.html with the shared layout, header and footer into public/,
# then compiles Tailwind CSS. Usage:  powershell -ExecutionPolicy Bypass -File build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
$utf8 = New-Object System.Text.UTF8Encoding($false)
function Read-Src($p) { [IO.File]::ReadAllText((Join-Path $root $p), $utf8) }

$layout = Read-Src 'src\partials\layout.html'
$header = Read-Src 'src\partials\header.html'
$footer = Read-Src 'src\partials\footer.html'
$siteUrl = 'https://jagonariunnayon.org'

Get-ChildItem (Join-Path $root 'src\pages') -Filter *.html | ForEach-Object {
  $raw = [IO.File]::ReadAllText($_.FullName, $utf8)
  $meta = @{ title = 'JNUS'; description = ''; page = ''; theme = 'light'; image = 'assets/img/hero.jpg' }
  $m = [regex]::Match($raw, '(?s)^\s*---\r?\n(.*?)\r?\n---\r?\n')
  if ($m.Success) {
    foreach ($line in ($m.Groups[1].Value -split "\r?\n")) {
      $kv = [regex]::Match($line, '^\s*([\w-]+)\s*:\s*(.*)$')
      if ($kv.Success) { $meta[$kv.Groups[1].Value] = $kv.Groups[2].Value.Trim() }
    }
    $raw = $raw.Substring($m.Length)
  }
  $file = $_.Name
  $canonical = if ($file -eq 'index.html') { "$siteUrl/" } else { "$siteUrl/$file" }
  $h = $header
  if ($meta.page) { $h = $h.Replace("data-nav=""$($meta.page)""", "data-nav=""$($meta.page)"" aria-current=""page""") }
  $out = $layout.Replace('{{header}}', $h).Replace('{{footer}}', $footer).Replace('{{content}}', $raw)
  $out = $out.Replace('{{title}}', $meta.title).Replace('{{description}}', $meta.description)
  $out = $out.Replace('{{page}}', $meta.page).Replace('{{theme}}', $meta.theme)
  $out = $out.Replace('{{canonical}}', $canonical).Replace('{{image}}', "$siteUrl/$($meta.image)")
  $out = $out.Replace('{{year}}', (Get-Date).Year.ToString())
  [IO.File]::WriteAllText((Join-Path $root "public\$file"), $out, $utf8)
  Write-Host "built public/$file"
}

& (Join-Path $root 'tools\tailwindcss.exe') -c (Join-Path $root 'tailwind.config.js') -i (Join-Path $root 'src\styles.css') -o (Join-Path $root 'public\assets\css\style.css') --minify
