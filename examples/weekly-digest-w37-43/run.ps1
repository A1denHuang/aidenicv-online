param(
    [string]$QuestaBin = 'D:\Questasim\win64',
    [string]$OutDir = '.quartz/weekly-digest-check'
)
$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
Push-Location $repoRoot
try {
    New-Item -ItemType Directory -Force $OutDir | Out-Null
    $outputRoot = (Resolve-Path -LiteralPath $OutDir).Path
    # Questa 10.7c misparses absolute -lib paths containing spaces.
    $library = (Join-Path ([IO.Path]::GetRelativePath($repoRoot, $outputRoot)) 'work').Replace('\', '/')
    $vlib = Join-Path $QuestaBin 'vlib.exe'
    $vlog = Join-Path $QuestaBin 'vlog.exe'
    $vsim = Join-Path $QuestaBin 'vsim.exe'
    if (!(Test-Path -LiteralPath $library)) { & $vlib $library }
    & $vlog -work $library -sv (Join-Path $PSScriptRoot 'coverage.sv') (Join-Path $PSScriptRoot 'scheduling.sv') (Join-Path $PSScriptRoot 'assertions.sv') (Join-Path $PSScriptRoot 'drain.sv')
    if ($LASTEXITCODE -ne 0) { throw 'Questa compilation failed' }
    $cases = @(
        @{ Name = 'coverage'; Top = 'coverage_examples'; Marker = 'COVERAGE_EXAMPLES_PASS'; Args = @('-coverage') },
        @{ Name = 'scheduling'; Top = 'scheduling_examples'; Marker = 'NONBLOCKING_EVENT_PASS'; Args = @() },
        @{ Name = 'assertions'; Top = 'assertion_examples'; Marker = 'DISABLE_IFF_PASS failures=1'; Args = @() },
        @{ Name = 'drain-good'; Top = 'drain_example'; Marker = 'bad=0 calls=1 body_end_ns=1000 tail_ns=2000'; Args = @() },
        @{ Name = 'drain-bad'; Top = 'drain_example'; Marker = 'bad=1 calls=20 body_end_ns=1000 tail_ns=42000'; Args = @('+BAD') }
    )
    foreach ($case in $cases) {
        $log = Join-Path $outputRoot ($case.Name + '.log')
        $extra = $case.Args
        $commands = 'run -all; quit -f'
        if ($case.Name -eq 'coverage') {
            $reportPath = (Join-Path $outputRoot 'coverage.txt').Replace('\', '/')
            $databasePath = (Join-Path $outputRoot 'coverage.ucdb').Replace('\', '/')
            $commands = "run -all; coverage save {$databasePath}; coverage report -details -cvg -output {$reportPath}; quit -f"
        }
        & $vsim -c -onfinish stop -l $log -lib $library $case.Top @extra -do $commands
        if ($LASTEXITCODE -ne 0) { throw "$($case.Name) simulator failure" }
        $text = Get-Content -LiteralPath $log -Raw
        if (!$text.Contains($case.Marker) -or $text -match '\*\* Fatal:|UVM_FATAL\s*:\s*[1-9]|Errors:\s*[1-9]') {
            throw "$($case.Name) failed; inspect $log"
        }
    }
    # Check raw transition bin counts instead of trusting only a percentage.
    $coverage = Get-Content -LiteralPath (Join-Path $outputRoot 'coverage.txt') -Raw
    foreach ($row in @(
        @{ Instance = 'single_busy'; Counts = @(0, 0, 0) },
        @{ Instance = 'idle_busy'; Counts = @(1, 0, 0) },
        @{ Instance = 'four_busy'; Counts = @(0, 2, 0) },
        @{ Instance = 'repeated_idle'; Counts = @(1, 0, 0) }
    )) {
        $block = [regex]::Match($coverage, '(?s)Covergroup instance[^\r\n]*/' + $row.Instance + '\s+.*?(?=Covergroup instance| TYPE |TOTAL COVERGROUP|$)').Value
        $bins = @('idle_to_busy', 'busy_run', 'busy_to_any')
        for ($i = 0; $i -lt $bins.Count; $i++) {
            $match = [regex]::Match($block, 'bin ' + $bins[$i] + '\s+(\d+)\s+')
            if (!$match.Success -or [int]$match.Groups[1].Value -ne $row.Counts[$i]) { throw "Transition mismatch: $($row.Instance)/$($bins[$i])" }
        }
    }
    $iverilog = Get-Command iverilog -ErrorAction SilentlyContinue
    if ($iverilog) {
        $image = Join-Path $outputRoot 'scheduling.vvp'
        & iverilog -g2012 -DICARUS -s scheduling_examples -o $image (Join-Path $PSScriptRoot 'scheduling.sv')
        if ($LASTEXITCODE -ne 0) { throw 'Icarus compilation failed' }
        $icarusLog = & vvp $image
        $icarusLog | Set-Content -LiteralPath (Join-Path $outputRoot 'icarus.log')
        if ($LASTEXITCODE -ne 0 -or !($icarusLog -match 'NBA_DISABLE_FORK_PASS')) { throw 'Icarus scheduling failed' }
    }
    Write-Output 'WEEKLY_DIGEST_CHECKS_PASS'
} finally {
    Pop-Location
}
