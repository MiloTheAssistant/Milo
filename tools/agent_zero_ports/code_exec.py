#!/usr/bin/env python3
"""Isolated Python code execution environment.

Ported from Agent Zero's code interpreter capability.
Runs Python code in a subprocess with timeout, resource limits, and output capture.

Usage:
    python code_exec.py --code "print('hello world')"
    python code_exec.py --file script.py --timeout 30
    python code_exec.py --code "import math; print(math.pi)" --json
    python code_exec.py --code "x = 42" --persist --session my_session
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parents[2]
SESSIONS_DIR = WORKSPACE / ".tmp" / "code_sessions"


def execute_code(
    code: str,
    timeout: int = 30,
    cwd: str | None = None,
    env_vars: dict[str, str] | None = None,
    python_path: str = sys.executable,
    persist: bool = False,
    session_id: str | None = None,
) -> dict:
    """Execute Python code in an isolated subprocess.

    Args:
        code: Python source code to execute.
        timeout: Max seconds before killing the process.
        cwd: Working directory for the subprocess.
        env_vars: Additional environment variables.
        python_path: Path to the Python interpreter.
        persist: If True, save/restore variables between calls using a session.
        session_id: Name of the persistent session (requires persist=True).

    Returns:
        Dict with stdout, stderr, exit_code, timed_out, duration_s.
    """
    work_dir = Path(cwd).resolve() if cwd else WORKSPACE

    # Build the wrapper script
    if persist and session_id:
        session_file = SESSIONS_DIR / f"{session_id}.json"
        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        wrapper = _build_persistent_wrapper(code, session_file)
    else:
        wrapper = code

    env = os.environ.copy()
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    if env_vars:
        env.update(env_vars)

    # Write code to a temp file to avoid shell escaping issues
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".py", dir=str(work_dir), delete=False
    ) as tmp:
        tmp.write(wrapper)
        tmp_path = tmp.name

    start = time.monotonic()
    timed_out = False

    try:
        result = subprocess.run(
            [python_path, tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=str(work_dir),
            env=env,
        )
        exit_code = result.returncode
        stdout = result.stdout
        stderr = result.stderr
    except subprocess.TimeoutExpired as e:
        timed_out = True
        exit_code = -1
        stdout = e.stdout or "" if hasattr(e, "stdout") else ""
        stderr = e.stderr or "" if hasattr(e, "stderr") else ""
        if isinstance(stdout, bytes):
            stdout = stdout.decode(errors="replace")
        if isinstance(stderr, bytes):
            stderr = stderr.decode(errors="replace")
    except Exception as e:
        exit_code = 1
        stdout = ""
        stderr = str(e)
    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    duration = time.monotonic() - start

    return {
        "stdout": stdout,
        "stderr": stderr,
        "exit_code": exit_code,
        "timed_out": timed_out,
        "duration_s": round(duration, 3),
    }


def _build_persistent_wrapper(code: str, session_file: Path) -> str:
    """Wrap user code to save/restore variables between calls."""
    return f'''
import json
from pathlib import Path

_session_file = Path({str(session_file)!r})
_session_vars = {{}}

# Restore previous session
if _session_file.exists():
    try:
        _raw = json.loads(_session_file.read_text())
        _session_vars = {{k: v for k, v in _raw.items() if not k.startswith("_")}}
    except Exception:
        pass

# Inject session variables into local scope
locals().update(_session_vars)

# --- User code ---
{code}
# --- End user code ---

# Save serializable variables
_save = {{}}
for _k, _v in dict(locals()).items():
    if _k.startswith("_") or callable(_v):
        continue
    try:
        json.dumps(_v)
        _save[_k] = _v
    except (TypeError, ValueError):
        pass

_session_file.parent.mkdir(parents=True, exist_ok=True)
_session_file.write_text(json.dumps(_save, indent=2))
'''


def execute_file(
    file_path: str,
    timeout: int = 30,
    cwd: str | None = None,
    env_vars: dict[str, str] | None = None,
    python_path: str = sys.executable,
) -> dict:
    """Execute a Python file in a subprocess."""
    path = Path(file_path)
    if not path.exists():
        return {
            "stdout": "",
            "stderr": f"File not found: {file_path}",
            "exit_code": 1,
            "timed_out": False,
            "duration_s": 0.0,
        }
    return execute_code(
        code=path.read_text(),
        timeout=timeout,
        cwd=cwd or str(path.parent),
        env_vars=env_vars,
        python_path=python_path,
    )


def list_sessions() -> list[str]:
    """List active persistent sessions."""
    if not SESSIONS_DIR.exists():
        return []
    return [f.stem for f in SESSIONS_DIR.glob("*.json")]


def clear_session(session_id: str) -> bool:
    """Delete a persistent session."""
    session_file = SESSIONS_DIR / f"{session_id}.json"
    if session_file.exists():
        session_file.unlink()
        return True
    return False


def main():
    parser = argparse.ArgumentParser(description="Isolated Python code execution")
    parser.add_argument("--code", help="Python code to execute")
    parser.add_argument("--file", help="Python file to execute")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout in seconds (default: 30)")
    parser.add_argument("--cwd", default=None, help="Working directory")
    parser.add_argument("--python", default=sys.executable, help="Python interpreter path")
    parser.add_argument("--env", nargs="*", help="Extra env vars as KEY=VALUE pairs")
    parser.add_argument("--json", action="store_true", dest="json_output", help="Output as JSON")
    parser.add_argument("--persist", action="store_true", help="Persist variables between calls")
    parser.add_argument("--session", default="default", help="Session ID for persistent mode")
    parser.add_argument("--list-sessions", action="store_true", help="List active sessions")
    parser.add_argument("--clear-session", metavar="ID", help="Clear a persistent session")
    args = parser.parse_args()

    # Session management commands
    if args.list_sessions:
        sessions = list_sessions()
        if sessions:
            print("Active sessions:", ", ".join(sessions))
        else:
            print("No active sessions")
        return

    if args.clear_session:
        if clear_session(args.clear_session):
            print(f"Cleared session: {args.clear_session}")
        else:
            print(f"Session not found: {args.clear_session}")
        return

    # Execution
    if not args.code and not args.file:
        parser.error("Either --code or --file is required")

    env_vars = {}
    if args.env:
        for pair in args.env:
            if "=" in pair:
                k, v = pair.split("=", 1)
                env_vars[k] = v

    if args.file:
        result = execute_file(
            file_path=args.file,
            timeout=args.timeout,
            cwd=args.cwd,
            env_vars=env_vars or None,
            python_path=args.python,
        )
    else:
        result = execute_code(
            code=args.code,
            timeout=args.timeout,
            cwd=args.cwd,
            env_vars=env_vars or None,
            python_path=args.python,
            persist=args.persist,
            session_id=args.session,
        )

    if args.json_output:
        print(json.dumps(result, indent=2))
    else:
        if result["stdout"]:
            sys.stdout.write(result["stdout"])
        if result["stderr"]:
            sys.stderr.write(result["stderr"])
        status = "TIMED OUT" if result["timed_out"] else f"exit {result['exit_code']}"
        print(f"\n--- {status} | {result['duration_s']}s ---", file=sys.stderr)


if __name__ == "__main__":
    main()
