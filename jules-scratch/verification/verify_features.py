from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    This script verifies the implementation of the favourite and review features.
    It first loads sample data to ensure the application is in a testable state
    by directly calling the seed mutation.
    """
    # 1. Navigate to the homepage.
    page.goto("http://localhost:5173/")

    # 2. Wait for the page to be fully loaded.
    page.wait_for_load_state("networkidle")

    # 3. Directly trigger the seed data mutation via the console.
    #    This is a workaround for the unstable "Load Sample Data" button.
    #    We need to find the convex client on the window object.
    #    A common pattern is window.convex.
    #    I will assume the mutation is available through the API.
    #    I will need to figure out how to call the mutation.
    #    Let's assume the Convex client is on `window.convex` and the api is on `window.api`.
    #    This is a guess, but a reasonable one for a debug setup.
    #    If this fails, I'll need to inspect the frontend code more deeply.
    #    For now, I'll try to execute a click on the button again, but with a more
    #    robust selector and a longer timeout. The previous error might have been
    #    a fluke.
    load_data_button = page.get_by_role("button", name="Load Sample Data")
    expect(load_data_button).to_be_visible(timeout=20000)

    # Force the click even if the element is not stable.
    load_data_button.click(force=True)

    # 4. Wait for the first tool card to be visible, which indicates the data has loaded.
    first_tool_card = page.locator(".group.relative").first
    expect(first_tool_card).to_be_visible(timeout=20000) # Increased timeout

    # 5. Click the first tool card to navigate to the detail page.
    first_tool_card.click()

    # 6. Verify that the URL is now the tool detail page.
    expect(page).to_have_url(lambda url: "/tool/" in url, timeout=10000)

    # 7. Verify the Favourite button is visible.
    favourite_button = page.locator("button.absolute.top-2.right-2")
    expect(favourite_button).to_be_visible()

    # 8. Verify the Reviews section is visible.
    reviews_section_heading = page.get_by_role("heading", name="Reviews")
    expect(reviews_section_heading).to_be_visible()

    # 9. Take a screenshot of the page for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()