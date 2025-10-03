from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Verify Browse Page
    page.goto("http://localhost:5174/")
    # Wait for the heading to be visible before taking a screenshot
    page.wait_for_selector('h1:has-text("AI Tools Database")')
    page.screenshot(path="jules-scratch/verification/browse-page-fixed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)