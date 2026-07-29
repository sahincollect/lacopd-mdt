$files = Get-ChildItem -Recurse -Include '*.tsx','*.ts' -Path 'C:\Users\yesah\.gemini\antigravity\scratch\lapd-mdt\src'
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $new = $content `
        -replace '#00D4FF','#3B82F6' `
        -replace 'rgba\(0,212,255','rgba(59,130,246' `
        -replace 'rgba\(0, 212, 255','rgba(59, 130, 246'
    if ($new -ne $content) {
        Set-Content $file.FullName $new -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done."
