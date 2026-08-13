[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$componentRoot = Join-Path $repositoryRoot "custom_components\octopus_media"
$distributionBundle = Join-Path $repositoryRoot "dist\octopus-media-card.js"
$runtimeBundle = Join-Path $componentRoot "frontend\octopus-media-card.js"
$distDirectory = Join-Path $repositoryRoot "dist"
$packagePath = Join-Path $distDirectory "octopus-media-card-dev.zip"
$temporaryPath = "$packagePath.tmp"
$archivePrefix = "custom_components/octopus_media/"
$fixedTimestamp = [DateTimeOffset]::new(2000, 1, 1, 0, 0, 0, [TimeSpan]::Zero)

function Get-RelativePathUnderRoot {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Path
    )

    $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd("\", "/") + [IO.Path]::DirectorySeparatorChar
    $fullPath = [IO.Path]::GetFullPath($Path)
    if (-not $fullPath.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path is outside the expected root."
    }
    return $fullPath.Substring($rootPath.Length).Replace("\", "/")
}

function Get-RepositoryRelativePath {
    param([Parameter(Mandatory)][string]$Path)

    return Get-RelativePathUnderRoot -Root $repositoryRoot -Path $Path
}

function Test-IsRuntimeFile {
    param([Parameter(Mandatory)][IO.FileInfo]$File)

    $relative = Get-RelativePathUnderRoot -Root $componentRoot -Path $File.FullName
    if ($relative -match "(^|/)__pycache__(/|$)") {
        return $false
    }
    if ($File.Extension -eq ".py") {
        return $true
    }
    if ($relative -eq "manifest.json") {
        return $true
    }
    if ($relative -match "^translations/[^/]+\.json$") {
        return $true
    }
    return $relative -eq "frontend/octopus-media-card.js"
}

function Assert-SafeText {
    param(
        [Parameter(Mandatory)][string]$Text,
        [Parameter(Mandatory)][string]$ArchiveName
    )

    $checks = [ordered]@{
        "private IPv4 address" = '(?<![0-9])(?:10\.(?:[0-9]{1,3}\.){2}[0-9]{1,3}|192\.168\.(?:[0-9]{1,3}\.)[0-9]{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.(?:[0-9]{1,3}\.)[0-9]{1,3})(?![0-9])'
        "local URL" = '(?i)https?://(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?|[^/\s:]+\.local)(?::[0-9]+)?(?:/|\b)'
        "local Windows profile path" = '(?i)[A-Z]:\\Users\\[^\\\s]+'
        "literal credential" = '(?i)(?:api[_-]?key|password|passwd|token|authorization)\s*["'']?\s*[:=]\s*["''][A-Za-z0-9+/_=-]{12,}["'']'
        "Jellyfin-style 32-hex identifier" = '(?<![A-Za-z0-9])[0-9a-fA-F]{32}(?![A-Za-z0-9])'
        "UUID identifier" = '(?i)(?<![A-Za-z0-9])[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?![A-Za-z0-9])'
    }
    foreach ($check in $checks.GetEnumerator()) {
        if ($Text -match $check.Value) {
            throw "Package audit rejected ${ArchiveName}: detected $($check.Key)."
        }
    }
}

if (-not [IO.Directory]::Exists($componentRoot)) {
    throw "Runtime component directory was not found: $componentRoot"
}
if (-not [IO.File]::Exists($distributionBundle) -or -not [IO.File]::Exists($runtimeBundle)) {
    throw "Both compiled bundles must exist. Run 'pnpm --dir frontend build' first."
}

$distributionHash = (Get-FileHash -LiteralPath $distributionBundle -Algorithm SHA256).Hash
$runtimeHash = (Get-FileHash -LiteralPath $runtimeBundle -Algorithm SHA256).Hash
if ($distributionHash -ne $runtimeHash) {
    throw "Compiled bundles differ. Run the frontend build and bundle verification first."
}

[IO.Directory]::CreateDirectory($distDirectory) | Out-Null
$distFullPath = [IO.Path]::GetFullPath($distDirectory) + [IO.Path]::DirectorySeparatorChar
if (-not $packagePath.StartsWith($distFullPath, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to write a package outside the repository dist directory."
}

$files = @(
    Get-ChildItem -LiteralPath $componentRoot -Recurse -File |
        Where-Object { Test-IsRuntimeFile $_ } |
        Sort-Object { Get-RepositoryRelativePath $_.FullName }
)

$required = @(
    "custom_components/octopus_media/__init__.py",
    "custom_components/octopus_media/manifest.json",
    "custom_components/octopus_media/frontend/octopus-media-card.js",
    "custom_components/octopus_media/translations/en.json",
    "custom_components/octopus_media/translations/pt-BR.json"
)
$sourceNames = @($files | ForEach-Object { Get-RepositoryRelativePath $_.FullName })
foreach ($requiredName in $required) {
    if ($requiredName -notin $sourceNames) {
        throw "Required runtime file is missing: $requiredName"
    }
}

foreach ($file in $files) {
    if (($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
        throw "Package input cannot be a symbolic link or reparse point: $($file.FullName)"
    }
    Assert-SafeText -Text ([IO.File]::ReadAllText($file.FullName)) -ArchiveName (Get-RepositoryRelativePath $file.FullName)
}

try {
    if ([IO.File]::Exists($temporaryPath)) {
        [IO.File]::Delete($temporaryPath)
    }
    $stream = [IO.File]::Open($temporaryPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::ReadWrite, [IO.FileShare]::None)
    try {
        $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create, $true)
        try {
            foreach ($file in $files) {
                $name = Get-RepositoryRelativePath $file.FullName
                $entry = $archive.CreateEntry($name, [IO.Compression.CompressionLevel]::Optimal)
                $entry.LastWriteTime = $fixedTimestamp
                $entryStream = $entry.Open()
                $fileStream = [IO.File]::OpenRead($file.FullName)
                try {
                    $fileStream.CopyTo($entryStream)
                }
                finally {
                    $fileStream.Dispose()
                    $entryStream.Dispose()
                }
            }
        }
        finally {
            $archive.Dispose()
        }
    }
    finally {
        $stream.Dispose()
    }

    $verifiedNames = [Collections.Generic.List[string]]::new()
    $verificationArchive = [IO.Compression.ZipFile]::OpenRead($temporaryPath)
    try {
        foreach ($entry in $verificationArchive.Entries) {
            $name = $entry.FullName
            if (-not $name.StartsWith($archivePrefix, [StringComparison]::Ordinal)) {
                throw "Package audit rejected an entry outside $archivePrefix"
            }
            if ($name -match "(?i)(^|/)(?:node_modules|tests?|fixtures?|docs?|__pycache__|\.pytest_cache|\.mypy_cache|\.ruff_cache|\.venv|\.python|\.tools)(/|$)" -or
                $name -match "(?i)(^|/)\.env(?:\.|$)" -or
                $name -match "(?i)\.(?:py[co]|tmp|temp|log|bak|swp|map)$") {
                throw "Package audit rejected forbidden entry: $name"
            }
            $reader = [IO.StreamReader]::new($entry.Open(), [Text.UTF8Encoding]::new($false, $true), $true)
            try {
                Assert-SafeText -Text $reader.ReadToEnd() -ArchiveName $name
            }
            finally {
                $reader.Dispose()
            }
            $verifiedNames.Add($name)
        }
    }
    finally {
        $verificationArchive.Dispose()
    }

    if ($sourceNames.Count -ne $verifiedNames.Count) {
        throw "Package audit found an unexpected entry count."
    }
    foreach ($requiredName in $required) {
        if (-not $verifiedNames.Contains($requiredName)) {
            throw "Package audit did not find required entry: $requiredName"
        }
    }

    if ([IO.File]::Exists($packagePath)) {
        [IO.File]::Delete($packagePath)
    }
    [IO.File]::Move($temporaryPath, $packagePath)
}
finally {
    if ([IO.File]::Exists($temporaryPath)) {
        [IO.File]::Delete($temporaryPath)
    }
}

$packageHash = (Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash
Write-Output "Created: $packagePath"
Write-Output "Bundle SHA-256: $distributionHash"
Write-Output "Package SHA-256: $packageHash"
Write-Output "Package contents ($($sourceNames.Count) files):"
$sourceNames | ForEach-Object { Write-Output "  - $_" }
Write-Output "Audit passed: runtime-only paths; no local artifacts or recognized secret/local-address patterns."
