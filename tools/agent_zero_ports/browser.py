#!/usr/bin/env python3
"""CDP-based browser automation wrapper.

Ported from Agent Zero's browser automation capability.
Connects to a running Chrome/Chromium instance via Chrome DevTools Protocol.

Prerequisites:
    Launch Chrome with remote debugging:
        google-chrome --headless --remote-debugging-port=9222

    Or Chromium:
        chromium-browser --headless --remote-debugging-port=9222

Dependencies:
    pip install websockets

Usage:
    python browser.py --action navigate --url "https://example.com"
    python browser.py --action screenshot --output page.png
    python browser.py --action get_text
    python browser.py --action click --selector "#submit-btn"
    python browser.py --action type --selector "#search" --text "hello world"
    python browser.py --action evaluate --expression "document.title"
    python browser.py --action get_html --selector "main"
"""

import argparse
import asyncio
import base64
import json
import sys
from pathlib import Path

try:
    import websockets
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False


CDP_HOST = "127.0.0.1"
CDP_PORT = 9222
_msg_id = 0


def next_id() -> int:
    global _msg_id
    _msg_id += 1
    return _msg_id


async def get_ws_url(host: str = CDP_HOST, port: int = CDP_PORT) -> str:
    """Get the WebSocket debugger URL from Chrome's /json endpoint."""
    try:
        import urllib.request
        url = f"http://{host}:{port}/json"
        with urllib.request.urlopen(url, timeout=5) as resp:
            targets = json.loads(resp.read())
        # Find a page target
        for target in targets:
            if target.get("type") == "page":
                return target["webSocketDebuggerUrl"]
        # Fallback: use /json/version
        url = f"http://{host}:{port}/json/version"
        with urllib.request.urlopen(url, timeout=5) as resp:
            version = json.loads(resp.read())
        return version["webSocketDebuggerUrl"]
    except Exception as e:
        raise ConnectionError(
            f"Cannot connect to Chrome DevTools at {host}:{port}. "
            f"Launch Chrome with: google-chrome --headless --remote-debugging-port={port}\n"
            f"Error: {e}"
        )


async def send_command(ws, method: str, params: dict | None = None) -> dict:
    """Send a CDP command and wait for the result."""
    msg_id = next_id()
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))

    while True:
        response = json.loads(await ws.recv())
        if response.get("id") == msg_id:
            if "error" in response:
                raise RuntimeError(f"CDP error: {response['error']}")
            return response.get("result", {})


async def navigate(ws, url: str) -> dict:
    """Navigate to a URL and wait for the page to load."""
    result = await send_command(ws, "Page.navigate", {"url": url})
    # Wait for load event
    await send_command(ws, "Page.enable")
    # Give the page time to settle
    await asyncio.sleep(1)
    return {"status": "navigated", "url": url, "frameId": result.get("frameId")}


async def screenshot(ws, output_path: str | None = None, full_page: bool = False) -> dict:
    """Take a screenshot of the current page."""
    params = {"format": "png"}
    if full_page:
        # Get full page dimensions
        layout = await send_command(ws, "Page.getLayoutMetrics")
        content_size = layout.get("contentSize", {})
        params["clip"] = {
            "x": 0,
            "y": 0,
            "width": content_size.get("width", 1920),
            "height": content_size.get("height", 1080),
            "scale": 1,
        }

    result = await send_command(ws, "Page.captureScreenshot", params)
    img_data = base64.b64decode(result["data"])

    if output_path:
        Path(output_path).write_bytes(img_data)
        return {"status": "saved", "path": output_path, "size_bytes": len(img_data)}
    else:
        # Write to stdout as base64
        return {"status": "captured", "size_bytes": len(img_data), "base64_length": len(result["data"])}


async def get_text(ws, selector: str | None = None) -> dict:
    """Extract text content from the page or a specific element."""
    if selector:
        js = f'document.querySelector("{selector}")?.innerText || ""'
    else:
        js = "document.body.innerText"
    result = await send_command(ws, "Runtime.evaluate", {"expression": js})
    text = result.get("result", {}).get("value", "")
    return {"text": text}


async def get_html(ws, selector: str | None = None) -> dict:
    """Get HTML content from the page or a specific element."""
    if selector:
        js = f'document.querySelector("{selector}")?.outerHTML || ""'
    else:
        js = "document.documentElement.outerHTML"
    result = await send_command(ws, "Runtime.evaluate", {"expression": js})
    html = result.get("result", {}).get("value", "")
    return {"html": html}


async def click(ws, selector: str) -> dict:
    """Click an element matching the CSS selector."""
    # Get element center coordinates
    js = f"""
    (() => {{
        const el = document.querySelector("{selector}");
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {{x: rect.x + rect.width/2, y: rect.y + rect.height/2}};
    }})()
    """
    result = await send_command(ws, "Runtime.evaluate", {
        "expression": js,
        "returnByValue": True,
    })
    coords = result.get("result", {}).get("value")
    if not coords:
        return {"status": "error", "message": f"Element not found: {selector}"}

    x, y = coords["x"], coords["y"]
    # Dispatch mouse events
    for event_type in ["mousePressed", "mouseReleased"]:
        await send_command(ws, "Input.dispatchMouseEvent", {
            "type": event_type,
            "x": x,
            "y": y,
            "button": "left",
            "clickCount": 1,
        })

    return {"status": "clicked", "selector": selector, "x": x, "y": y}


async def type_text(ws, selector: str, text: str, clear: bool = True) -> dict:
    """Type text into an element. Optionally clear the field first."""
    # Focus the element
    js = f'document.querySelector("{selector}")?.focus()'
    await send_command(ws, "Runtime.evaluate", {"expression": js})

    if clear:
        # Select all and delete
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyDown", "key": "a", "modifiers": 2,  # Ctrl+A
        })
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyUp", "key": "a", "modifiers": 2,
        })
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyDown", "key": "Backspace",
        })
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyUp", "key": "Backspace",
        })

    # Type each character
    for char in text:
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyDown",
            "text": char,
        })
        await send_command(ws, "Input.dispatchKeyEvent", {
            "type": "keyUp",
            "key": char,
        })

    return {"status": "typed", "selector": selector, "length": len(text)}


async def evaluate(ws, expression: str) -> dict:
    """Evaluate arbitrary JavaScript in the page context."""
    result = await send_command(ws, "Runtime.evaluate", {
        "expression": expression,
        "returnByValue": True,
    })
    value = result.get("result", {}).get("value")
    desc = result.get("result", {}).get("description", "")
    return {"value": value, "description": desc}


async def wait_for(ws, selector: str, timeout: int = 10) -> dict:
    """Wait for an element to appear in the DOM."""
    start = asyncio.get_event_loop().time()
    while True:
        js = f'!!document.querySelector("{selector}")'
        result = await send_command(ws, "Runtime.evaluate", {"expression": js})
        if result.get("result", {}).get("value"):
            return {"status": "found", "selector": selector}
        elapsed = asyncio.get_event_loop().time() - start
        if elapsed > timeout:
            return {"status": "timeout", "selector": selector, "waited_s": timeout}
        await asyncio.sleep(0.25)


async def run_action(action: str, **kwargs) -> dict:
    """Connect to Chrome and execute an action."""
    host = kwargs.pop("host", CDP_HOST)
    port = kwargs.pop("port", CDP_PORT)

    ws_url = await get_ws_url(host, port)
    async with websockets.connect(ws_url, max_size=50 * 1024 * 1024) as ws:
        actions = {
            "navigate": lambda: navigate(ws, kwargs["url"]),
            "screenshot": lambda: screenshot(ws, kwargs.get("output"), kwargs.get("full_page", False)),
            "get_text": lambda: get_text(ws, kwargs.get("selector")),
            "get_html": lambda: get_html(ws, kwargs.get("selector")),
            "click": lambda: click(ws, kwargs["selector"]),
            "type": lambda: type_text(ws, kwargs["selector"], kwargs["text"], kwargs.get("clear", True)),
            "evaluate": lambda: evaluate(ws, kwargs["expression"]),
            "wait_for": lambda: wait_for(ws, kwargs["selector"], kwargs.get("timeout", 10)),
        }
        if action not in actions:
            return {"error": f"Unknown action: {action}. Available: {list(actions.keys())}"}
        return await actions[action]()


def main():
    if not HAS_WEBSOCKETS:
        print("ERROR: 'websockets' package required. Install with: pip install websockets", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="CDP-based browser automation")
    parser.add_argument("--action", required=True,
                        choices=["navigate", "screenshot", "get_text", "get_html",
                                 "click", "type", "evaluate", "wait_for"],
                        help="Action to perform")
    parser.add_argument("--url", help="URL to navigate to")
    parser.add_argument("--selector", help="CSS selector for element targeting")
    parser.add_argument("--text", help="Text to type into an element")
    parser.add_argument("--expression", help="JavaScript expression to evaluate")
    parser.add_argument("--output", help="File path for screenshot output")
    parser.add_argument("--full-page", action="store_true", help="Capture full page screenshot")
    parser.add_argument("--no-clear", action="store_true", help="Don't clear field before typing")
    parser.add_argument("--timeout", type=int, default=10, help="Wait timeout in seconds")
    parser.add_argument("--host", default=CDP_HOST, help=f"Chrome DevTools host (default: {CDP_HOST})")
    parser.add_argument("--port", type=int, default=CDP_PORT, help=f"Chrome DevTools port (default: {CDP_PORT})")
    args = parser.parse_args()

    result = asyncio.run(run_action(
        action=args.action,
        url=args.url,
        selector=args.selector,
        text=args.text,
        expression=args.expression,
        output=args.output,
        full_page=args.full_page,
        clear=not args.no_clear,
        timeout=args.timeout,
        host=args.host,
        port=args.port,
    ))

    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()
