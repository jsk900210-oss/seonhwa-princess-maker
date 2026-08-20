param(
    [string]$RepoPath = "C:\Users\jsk90\Documents\Codex\2026-08-12\referenced-chatgpt-conversation-this-is-an-2\outputs\seonhwa-princess-mvp",
    [string]$Branch = "agent/pixel-schedule-handoff",
    [int]$QuietMinutes = 10
)

$ErrorActionPreference = "Stop"
$Git = "C:\Program Files\Git\cmd\git.exe"
$LogDir = Join-Path $RepoPath ".local-backup-logs"
$LogFile = Join-Path $LogDir "auto-backup.log"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Log([string]$Message) {
    Add-Content -Path $LogFile -Value ("{0}  {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message) -Encoding UTF8
}

try {
    if (-not (Test-Path $Git)) { Log "SKIP: Git not found"; exit 2 }
    if (-not (Test-Path (Join-Path $RepoPath ".git"))) { Log "SKIP: Not a Git repository"; exit 3 }

    Set-Location $RepoPath

    foreach ($marker in @("MERGE_HEAD","CHERRY_PICK_HEAD","REVERT_HEAD","rebase-merge","rebase-apply")) {
        if (Test-Path (Join-Path $RepoPath ".git\$marker")) {
            Log "SKIP: Git operation in progress ($marker)"
            exit 4
        }
    }

    $currentBranch = (& $Git branch --show-current).Trim()
    if ($currentBranch -ne $Branch) {
        Log "SKIP: Current branch is '$currentBranch', expected '$Branch'"
        exit 5
    }

    $cutoff = (Get-Date).AddMinutes(-$QuietMinutes)
    $recent = Get-ChildItem -Path $RepoPath -Recurse -File -Force -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch '\\\.git\\' -and
            $_.FullName -notmatch '\\\.local-backup-logs\\' -and
            $_.FullName -notmatch '\\_pre_defringe_v2_backup\\' -and
            $_.LastWriteTime -gt $cutoff
        } |
        Select-Object -First 1

    if ($recent) {
        Log "SKIP: Files changed within last $QuietMinutes minutes"
        exit 0
    }

    & $Git fetch origin $Branch | Out-Null

    $remoteRef = "origin/$Branch"
    $counts = (& $Git rev-list --left-right --count "$remoteRef...HEAD").Trim() -split '\s+'
    $remoteAhead = [int]$counts[0]
    $localAhead = [int]$counts[1]

    if ($remoteAhead -gt 0) {
        Log "SKIP: Remote ahead by $remoteAhead commit(s)"
        exit 6
    }

    $raw = & $Git status --porcelain=v1 -z --untracked-files=all

    if (-not $raw) {
        if ($localAhead -gt 0) {
            & $Git push origin $Branch
            if ($LASTEXITCODE -eq 0) {
                Log "PUSH: Existing local commit(s) pushed"
                exit 0
            }
            throw "Push failed"
        }

        Log "OK: No changes"
        exit 0
    }

    $entries = $raw -split "`0" | Where-Object { $_ }
    $paths = New-Object System.Collections.Generic.List[string]

    foreach ($entry in $entries) {
        if ($entry.Length -lt 4) { continue }
        $path = $entry.Substring(3)

        if ($path -match " -> ") {
            $path = ($path -split " -> ")[-1]
        }

        $normalized = $path -replace '\\','/'

        if (
            $normalized -like "assets/cinematics/guardian/humanized/poses/_pre_defringe_v2_backup/*" -or
            $normalized -like ".local-backup-logs/*"
        ) {
            continue
        }

        $paths.Add($path)
    }

    $paths = $paths | Sort-Object -Unique

    if (-not $paths -or $paths.Count -eq 0) {
        Log "OK: Only excluded files changed"
        exit 0
    }

    foreach ($path in $paths) {
        & $Git add -- $path
        if ($LASTEXITCODE -ne 0) { throw "git add failed: $path" }
    }

    $staged = & $Git diff --cached --name-status
    if (-not $staged) {
        Log "OK: Nothing staged"
        exit 0
    }

    $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    & $Git commit -m "chore: hourly local backup $stamp"
    if ($LASTEXITCODE -ne 0) { throw "Commit failed" }

    & $Git push origin $Branch
    if ($LASTEXITCODE -ne 0) { throw "Push failed" }

    Log "BACKUP: Commit and push completed"
}
catch {
    Log "ERROR: $($_.Exception.Message)"
    exit 1
}
