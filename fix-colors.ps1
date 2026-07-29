$files = Get-ChildItem src/app/mdt -Recurse -Filter *.tsx
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $newContent = $content -replace '239,\s*68,\s*68', '14, 165, 233' `
                           -replace '220,\s*38,\s*38', '2, 132, 199' `
                           -replace '244,\s*63,\s*94', '14, 165, 233' `
                           -replace '#ef4444', '#0ea5e9' `
                           -replace '#dc2626', '#0284c7' `
                           -replace '#f87171', '#38bdf8' `
                           -replace '#fca5a5', '#7dd3fc' `
                           -replace '#991b1b', '#0369a1' `
                           -replace 'text-red-400', 'text-sky-400' `
                           -replace 'text-red-500', 'text-sky-500' `
                           -replace 'text-red-600', 'text-sky-600' `
                           -replace 'bg-red-500', 'bg-sky-500' `
                           -replace 'bg-red-600', 'bg-sky-600'
                           
    if ($content -cne $newContent) {
        [System.IO.File]::WriteAllText($f.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($f.FullName)"
    }
}
