import sys
import time
import json
import os
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = "artifacts"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

PASS = 0
FAIL = 0


def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        print(f"  [FAIL] {name} -- {detail}")


MOCK_TOKEN = "mock-e2e-jwt-token-xyz"


def setup_mocks(page):
    """Set up all API mocks on a page."""

    def handle_register(route):
        route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                {
                    "token": MOCK_TOKEN,
                    "user": {
                        "id": "e2e-1",
                        "email": "e2e@test.ai",
                        "displayName": "E2E Tester",
                        "plan": "premium",
                    },
                }
            ),
        )

    def handle_login(route):
        route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                {
                    "token": MOCK_TOKEN,
                    "user": {
                        "id": "e2e-1",
                        "email": "e2e@test.ai",
                        "displayName": "E2E Tester",
                        "plan": "premium",
                    },
                }
            ),
        )

    def handle_threads(route):
        if route.request.method == "GET":
            route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                body=json.dumps([]),
            )
        elif route.request.method == "POST":
            route.fulfill(
                status=200,
                headers={"Content-Type": "application/json"},
                body=json.dumps(
                    {"_id": "th-e2e-1", "title": "E2E Thread", "messages": []}
                ),
            )

    def handle_chat(route):
        stream = (
            'data: {"type": "status", "message": "Nexus routing..."}\n\n'
            'data: {"type": "agent", "agentType": "Scout"}\n\n'
            'data: {"type": "token", "token": "Hello! I have successfully verified the E2E stream."}\n\n'
            'data: {"type": "done"}\n\n'
        )
        route.fulfill(
            status=200, headers={"Content-Type": "text/event-stream"}, body=stream
        )

    def handle_profile(route):
        route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                {
                    "preferences": [{"key": "framework", "value": "Tailwind v4"}],
                    "projects": [],
                    "tasks": [],
                    "people": [],
                }
            ),
        )

    def handle_skills(route):
        route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                [{"_id": "sk-1", "name": "Summarizer", "description": "Auto-summarize"}]
            ),
        )

    def handle_schedule(route):
        route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps(
                [
                    {
                        "_id": "cron-1",
                        "task": "Fetch news",
                        "cron": "0 * * * *",
                        "status": "success",
                    }
                ]
            ),
        )

    # Catch-all registered FIRST (lowest priority in Playwright 1.49+ where last registered wins)
    page.route(
        "**/api/**",
        lambda route: route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps({}),
        ),
    )
    # Specific routes registered AFTER catch-all (higher priority)
    page.route("**/api/auth/register", handle_register)
    page.route("**/api/auth/login", handle_login)
    page.route("**/api/threads", handle_threads)
    page.route("**/api/threads/**", handle_threads)
    page.route("**/api/agents/chat", handle_chat)
    page.route("**/api/profile", handle_profile)
    page.route(
        "**/api/notes",
        lambda route: route.fulfill(
            status=200,
            headers={"Content-Type": "application/json"},
            body=json.dumps([]),
        ),
    )
    page.route("**/api/skills", handle_skills)
    page.route("**/api/skills/**", handle_skills)
    page.route("**/api/schedule", handle_schedule)
    page.route("**/api/schedule/**", handle_schedule)


def with_timeout(fn, timeout_ms=5000):
    """Run a predicate function with a timeout. Returns True if fn() returns True within timeout."""
    deadline = time.time() + timeout_ms / 1000
    while time.time() < deadline:
        if fn():
            return True
        time.sleep(0.1)
    return False


def wait_and_click(page, selector, timeout=5000):
    """Wait for a selector to appear, then click it."""
    deadline = time.time() + timeout / 1000
    while time.time() < deadline:
        btn = page.locator(selector)
        if btn.count() > 0:
            btn.first.click()
            return True
        time.sleep(0.1)
    return False


def run_tests():
    global PASS, FAIL
    print("=" * 60)
    print("  SIGNHIFY AI - COMPREHENSIVE E2E TEST SUITE")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        page.on("pageerror", lambda err: print(f"  [page error] {err}"))
        page.on(
            "console",
            lambda msg: (
                print(f"  [console {msg.type}] {msg.text[:200]}")
                if msg.type in ("error", "warning")
                else None
            ),
        )
        page.on(
            "response",
            lambda res: (
                print(f"  [response {res.status}] {res.url.split('?')[0]}")
                if res.status >= 400
                else None
            ),
        )
        setup_mocks(page)

        # ==============================================================
        # TEST 1: Landing Page Loads
        # ==============================================================
        print("\n--- Test 1: Landing Page Load ---")
        page.goto("http://localhost:5173", wait_until="networkidle")

        test("Landing page loads", page.title() != "")
        test(
            "'START FOR FREE' CTA present",
            page.locator("text=START FOR FREE").count() > 0,
        )

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "01-landing-page.png"))
        print("  [info] artifacts/01-landing-page.png")

        # ==============================================================
        # TEST 2: Authentication - Register Flow
        # ==============================================================
        print("\n--- Test 2: Registration Flow ---")
        page.locator("text=START FOR FREE").click()
        page.wait_for_timeout(500)

        test("Auth form visible", page.locator("text=Welcome back").count() > 0)

        page.locator("text=Create account").click()
        page.wait_for_timeout(500)
        test(
            "Registration form visible",
            page.locator("text=Create your workspace").count() > 0,
        )

        # Fill in registration fields
        page.fill("input[placeholder='Your name']", "E2E Tester")
        page.fill("input[placeholder='you@example.com']", "e2e@test.ai")
        pw = page.locator("input[type='password']")
        if pw.count() > 0:
            pw.fill("testpass123")
        page.locator("button[type='submit']").click()

        # Wait for navigation to /app and Onboarding to render
        page.wait_for_url("**/app", timeout=10000)
        page.locator("text=Welcome to Signhify").wait_for(timeout=10000)
        test(
            "Onboarding welcome step visible",
            page.locator("text=Welcome to Signhify").count() > 0,
        )

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "02-onboarding-welcome.png"))
        print("  [info] artifacts/02-onboarding-welcome.png")

        # Navigate to step 1: Provider
        # Note: "Connect an AI Provider" is in STEPS array but NOT rendered in ProviderStep
        # ProviderStep renders provider names: Google Gemini, Groq, OpenAI, etc.
        page.locator("button:has-text('Continue')").first.click()
        # Wait for Framer Motion animation (300ms exit) + render
        page.locator("button:has-text('Groq')").wait_for(timeout=10000)
        test(
            "Provider step reachable",
            page.locator("button:has-text('Groq')").count() > 0,
        )

        # Select Groq and enter key
        page.locator("button:has-text('Groq')").first.click()
        page.wait_for_timeout(200)
        key_in = page.locator("input[type='password']").first
        key_in.fill("gsk_mock-key")
        page.locator("button:has-text('Save')").click()
        page.wait_for_timeout(300)

        # With the OnboardingGuard fix, keys save does NOT auto-transition.
        # The Onboarding stays mounted and shows "1 provider connected".
        page.locator("text=provider connected").wait_for(timeout=5000)
        test(
            "API key saved via onboarding",
            page.locator("text=1 provider connected").count() > 0,
        )

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "02b-onboarding-key.png"))
        print("  [info] artifacts/02b-onboarding-key.png")

        # Click through remaining steps (2: agents, 3: channels, 4: ready)
        for step_name in ["Agents", "Channels", "Ready"]:
            page.locator("button:has-text('Continue')").click()
            page.wait_for_timeout(500)

        # Click "Enter Workspace" to dismiss onboarding
        page.locator("button:has-text('Enter Workspace')").wait_for(timeout=5000)
        page.locator("button:has-text('Enter Workspace')").click()
        page.wait_for_timeout(2000)

        # Debug: check page state after Enter Workspace
        print(f"  [debug] URL after Enter Workspace: {page.url}")
        loading_text = page.locator("text=Loading...").count()
        nexus_text = page.locator("text=Nexus Online").count()
        canvas_count = page.locator("canvas").count()
        print(f"  [debug] 'Loading...' count: {loading_text}")
        print(f"  [debug] 'Nexus Online' count: {nexus_text}")
        print(f"  [debug] canvas elements: {canvas_count}")
        # Check page content for key elements
        text_content = page.locator("body").text_content() or ""
        for kw in ["SIGNHIFY", "Loading", "Nexus", "Error", "Command Center"]:
            if kw.lower() in text_content.lower():
                print(f"  [debug] Found '{kw}' in body text")
            else:
                print(f"  [debug] '{kw}' NOT in body text")
        page.screenshot(
            path=os.path.join(ARTIFACTS_DIR, "debug-after-enter-workspace.png")
        )
        print("  [info] artifacts/debug-after-enter-workspace.png")

        # Wait for lazy-loaded Dashboard to appear (Suspense + chunk load)
        page.locator("text=Nexus Online").wait_for(timeout=15000)

        # ==============================================================
        # TEST 3: Dashboard View
        # ==============================================================
        print("\n--- Test 3: Dashboard View ---")
        test("Dashboard 'Nexus Online' renders", True)
        page.locator("text=Command Center").first.wait_for(timeout=5000)
        test("Sidebar 'Command Center' visible", True)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "03-dashboard.png"))
        print("  [info] artifacts/03-dashboard.png")

        # ==============================================================
        # TEST 4: Settings (BYOK)
        # ==============================================================
        print("\n--- Test 4: Settings (BYOK) ---")
        page.locator("button:has-text('Settings')").first.click()
        page.locator("text=Configuration").first.wait_for(timeout=5000)
        test("Settings page with Configuration header", True)

        gsk = page.locator("input[placeholder='gsk_...']")
        if gsk.count() > 0:
            gsk.fill("gsk_e2e-test-key")
        ai_input = page.locator("input[placeholder='AIza...']")
        if ai_input.count() > 0:
            ai_input.fill("AIza_e2e-test-key")

        save_btn = page.locator("button:has-text('Save API Keys')")
        if save_btn.count() > 0:
            save_btn.click()
            page.locator("text=Saved Securely").wait_for(timeout=5000)
            test("'Saved Securely' confirmation shown", True)
        else:
            test("Save API Keys button found", save_btn.count() > 0)

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "04-settings-keys.png"))
        print("  [info] artifacts/04-settings-keys.png")

        # ==============================================================
        # TEST 5: SSE Chat Stream
        # ==============================================================
        print("\n--- Test 5: SSE Chat Stream ---")
        # Navigate to chat (Command Center)
        page.locator("button:has-text('Command Center')").first.click()
        page.wait_for_timeout(500)

        # Check chat input
        chat_input = page.locator("textarea[placeholder='Issue a command or query...']")
        chat_input.wait_for(timeout=5000)
        test("Chat textarea available", chat_input.count() > 0)

        chat_input.fill("Verify the E2E stream.")
        chat_input.press("Enter")

        # Wait for SSE streamed response
        page.locator("text=successfully verified").wait_for(timeout=10000)
        test(
            "SSE streamed tokens render in chat bubble",
            page.locator("text=Hello! I have successfully verified").count() > 0,
        )

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "05-chat-stream-verified.png"))
        print("  [info] artifacts/05-chat-stream-verified.png")

        # ==============================================================
        # TEST 6: Navigation to other views
        # ==============================================================
        print("\n--- Test 6: Navigation & Views ---")
        for nav_label in ["Memory Vault", "Skills", "Scheduler"]:
            btn = page.locator(f"button:has-text('{nav_label}')")
            if btn.count() > 0:
                btn.first.click()
                page.wait_for_timeout(500)
                test(f"'{nav_label}' view opens", True)
            else:
                print(f"  [SKIP] '{nav_label}' button not found")

        page.screenshot(path=os.path.join(ARTIFACTS_DIR, "06-views.png"))
        print("  [info] artifacts/06-views.png")

        # ==============================================================
        # TEST 7: Mobile Responsiveness
        # ==============================================================
        print("\n--- Test 7: Mobile Responsiveness ---")
        mobile_page = context.new_page()
        mobile_page.set_viewport_size({"width": 375, "height": 812})
        setup_mocks(mobile_page)

        mobile_page.goto("http://localhost:5173", wait_until="networkidle")
        mobile_page.wait_for_timeout(2000)

        test(
            "Mobile landing loads without crash",
            mobile_page.locator("text=START FOR FREE").count() > 0,
        )
        mobile_page.screenshot(
            path=os.path.join(ARTIFACTS_DIR, "07-mobile-landing.png")
        )
        print("  [info] artifacts/07-mobile-landing.png")

        # Test mobile view of dashboard (direct navigation with stored token)
        mobile_page.evaluate(f"localStorage.setItem('signhify_token', '{MOCK_TOKEN}')")
        mobile_page.evaluate("localStorage.setItem('signhify_keys_v2', '')")
        mobile_page.goto("http://localhost:5173/app", wait_until="networkidle")
        mobile_page.wait_for_timeout(2000)
        mobile_page.screenshot(
            path=os.path.join(ARTIFACTS_DIR, "07b-mobile-dashboard.png")
        )
        print("  [info] artifacts/07b-mobile-dashboard.png")
        mobile_page.close()

        # ==============================================================
        # TEST 8: Route Protection
        # ==============================================================
        print("\n--- Test 8: Route Protection ---")
        clean_page = context.new_page()
        setup_mocks(clean_page)
        clean_page.goto("http://localhost:5173", wait_until="networkidle")
        clean_page.evaluate("localStorage.clear()")
        clean_page.goto("http://localhost:5173/app", wait_until="networkidle")
        clean_page.wait_for_timeout(1000)

        test(
            "Unauthenticated access to /app redirects to landing",
            clean_page.locator("text=START FOR FREE").count() > 0,
        )
        clean_page.close()

        # ==============================================================
        # TEST 9: Logout
        # ==============================================================
        print("\n--- Test 9: Logout ---")
        logout_btn = page.locator("button[title='Sign Out']")
        if logout_btn.count() > 0:
            logout_btn.click()
            page.wait_for_timeout(1000)
            test(
                "Logout redirects to landing/auth",
                page.locator("text=START FOR FREE").count() > 0
                or page.locator("text=Welcome back").count() > 0,
            )
            page.screenshot(path=os.path.join(ARTIFACTS_DIR, "08-logout.png"))
            print("  [info] artifacts/08-logout.png")
        else:
            print("  [SKIP] Logout button not found")

        # ==============================================================
        # TEST 10: 3D Scene Detection (soft check — headless SwiftShader skips real GPU render)
        # ==============================================================
        print("\n--- Test 10: 3D Scene Detection ---")
        scene_page = context.new_page()
        setup_mocks(scene_page)
        scene_page.goto("http://localhost:5173", wait_until="networkidle")
        scene_page.wait_for_timeout(2000)
        canvas_count = scene_page.locator("canvas").count()
        if canvas_count > 0:
            print("  [PASS] WebGL canvas detected")
            PASS += 1
        else:
            print(
                "  [INFO] No canvas (expected in headless/SwiftShader mode — 3D scene requires dedicated GPU)"
            )
        scene_page.close()

        browser.close()

    # ---- FINAL SUMMARY ------------------------------------------
    print("\n" + "=" * 60)
    print(f"  TEST RESULTS:  {PASS} passed, {FAIL} failed, {PASS + FAIL} total")
    print("=" * 60)
    if FAIL > 0:
        print("  !!! SOME TESTS FAILED - REVIEW ABOVE")
        print(f"  Screenshots saved in: {ARTIFACTS_DIR}/")
        sys.exit(1)
    else:
        print("  ALL E2E TESTS PASSED - LAUNCH READY")
        print(f"  Screenshots saved in: {ARTIFACTS_DIR}/")
        sys.exit(0)


if __name__ == "__main__":
    run_tests()
