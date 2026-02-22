#!/usr/bin/env python3
"""Execute shell commands with streaming output, timeout control, and working directory management.

Ported from Agent Zero's terminal execution capability.

Usage:
    python terminal.py --command "ls -la"
    python terminal.py --command "ping -c 3 google.com" --timeout 10
    python terminal.py --command "npm install" --cwd /path/to/project --stream
    python terminal.py --command "echo hello" --shell /bin/zsh
"""

import argparse
import json
import os
import select
import subprocess
import sys
import time
from pathlib import Path


def execute(
    command: str,
    cwd: str | None = None,
    timeout: int = 120,
    stream: bool = False,
    shell_path: str = "/bin/bash",
    env_vars: dict[str, str] | None = None,
) -> dict:
    """Execute a shell command and return structured results.

    Args:
        command: The shell command to run.
        cwd: Working directory (defaults to current).
        timeout: Max seconds before killing the process.
        stream: If True, print output lines as they arrive.
        shell_path: Shell to use (default /bin/bash).
        env_vars: Additional environment variables to inject.

    Returns:
        Dict with stdout, stderr, exit_code, timed_out, duration_s.
    """
    work_dir = Path(cwd).resolve() if cwd else Path.cwd()
    if not work_dir.is_dir():
        return {
            "stdout": "",
            "stderr": f"Working directory does not exist: {work_dir}",
            "exit_code": 1,
            "timed_out": False,
            "duration_s": 0.0,
        }

    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)

    start = time.monotonic()
    stdout_parts: list[str] = []
    stderr_parts: list[str] = []
    timed_out = False

    try:
        proc = subprocess.Popen(
            command,
            shell=True,
            executable=shell_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(work_dir),
            env=env,
            text=True,
            bufsize=1,
        )

        if stream:
            # Stream stdout line-by-line in real time
            while True:
                elapsed = time.monotonic() - start
                if elapsed > timeout:
                    proc.kill()
                    timed_out = True
                    break

                # Use select for non-blocking reads (Unix only)
                readable, _, _ = select.select(
                    [proc.stdout, proc.stderr], [], [], 0.1
                )
                for fd in readable:
                    line = fd.readline()
                    if line:
                        if fd is proc.stdout:
                            stdout_parts.append(line)
                            sys.stdout.write(line)
                            sys.stdout.flush()
                        else:
                            stderr_parts.append(line)
                            sys.stderr.write(line)
                            sys.stderr.flush()

                if proc.poll() is not None:
                    # Process finished — drain remaining output
                    for line in proc.stdout:
                        stdout_parts.append(line)
                        sys.stdout.write(line)
                        sys.stdout.flush()
                    for line in proc.stderr:
                        stderr_parts.append(line)
                        sys.stderr.write(line)
                        sys.stderr.flush()
                    break
        else:
            try:
                stdout_raw, stderr_raw = proc.communicate(timeout=timeout)
                stdout_parts.append(stdout_raw)
                stderr_parts.append(stderr_raw)
            except subprocess.TimeoutExpired:
                proc.kill()
                stdout_raw, stderr_raw = proc.communicate()
                stdout_parts.append(stdout_raw)
                stderr_parts.append(stderr_raw)
                timed_out = True

        exit_code = proc.returncode if proc.returncode is not None else -1

    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "exit_code": 1,
            "timed_out": False,
            "duration_s": time.monotonic() - start,
        }

    duration = time.monotonic() - start

    return {
        "stdout": "".join(stdout_parts),
        "stderr": "".join(stderr_parts),
        "exit_code": exit_code,
        "timed_out": timed_out,
        "duration_s": round(duration, 3),
    }


def main():
    parser = argparse.ArgumentParser(description="Execute shell commands with streaming output")
    parser.add_argument("--command", required=True, help="Shell command to execute")
    parser.add_argument("--cwd", default=None, help="Working directory")
    parser.add_argument("--timeout", type=int, default=120, help="Timeout in seconds (default: 120)")
    parser.add_argument("--stream", action="store_true", help="Stream output in real time")
    parser.add_argument("--shell", default="/bin/bash", help="Shell to use (default: /bin/bash)")
    parser.add_argument("--env", nargs="*", help="Extra env vars as KEY=VALUE pairs")
    parser.add_argument("--json", action="store_true", dest="json_output", help="Output result as JSON")
    args = parser.parse_args()

    env_vars = {}
    if args.env:
        for pair in args.env:
            if "=" in pair:
                k, v = pair.split("=", 1)
                env_vars[k] = v

    result = execute(
        command=args.command,
        cwd=args.cwd,
        timeout=args.timeout,
        stream=args.stream,
        shell_path=args.shell,
        env_vars=env_vars or None,
    )

    if args.json_output:
        print(json.dumps(result, indent=2))
    elif not args.stream:
        # Print stdout/stderr for non-streaming mode
        if result["stdout"]:
            sys.stdout.write(result["stdout"])
        if result["stderr"]:
            sys.stderr.write(result["stderr"])

        # Print summary to stderr so it doesn't pollute stdout
        print(
            f"\n--- exit: {result['exit_code']} | "
            f"{'TIMED OUT | ' if result['timed_out'] else ''}"
            f"{result['duration_s']}s ---",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
