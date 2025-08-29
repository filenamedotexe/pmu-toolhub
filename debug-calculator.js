const { chromium } = require('@playwright/test');

async function debugCalculator() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
    devtools: true  // Open dev tools to see console errors
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🚨 BROWSER ERROR:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.message);
  });
  
  try {
    console.log('🔍 DEBUGGING PMU Revenue Calculator');
    
    // Step 1: Auth
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Authenticated');
    
    // Step 2: Open calculator
    console.log('📊 Opening calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"');
    console.log('✅ Calculator loaded');
    
    // Step 3: Debug form state
    console.log('🔍 DEBUGGING: Checking form state...');
    
    // Check if session exists
    const sessionExists = await page.evaluate(() => {
      return window.location.search.includes('session=');
    });
    console.log('Session in URL:', sessionExists);
    
    // Fill form step by step
    console.log('📝 Filling service form...');
    await page.fill('#name', 'Test Service');
    console.log('  ✅ Name filled');
    
    await page.fill('#price', '100');
    console.log('  ✅ Price filled');
    
    await page.fill('#duration_minutes', '60');
    console.log('  ✅ Duration filled');
    
    // Try to interact with select
    console.log('🔍 Debugging Select component...');
    const selectTrigger = page.locator('button[role="combobox"]').first();
    const isSelectVisible = await selectTrigger.isVisible();
    console.log('Select trigger visible:', isSelectVisible);
    
    if (isSelectVisible) {
      await selectTrigger.click();
      await page.waitForTimeout(1000);
      
      // Check if options are visible
      const optionsVisible = await page.locator('[role="option"]').first().isVisible();
      console.log('Select options visible:', optionsVisible);
      
      if (optionsVisible) {
        await page.click('[role="option"]:has-text("First Session")');
        console.log('  ✅ Service type selected');
      } else {
        console.log('  ❌ Options not visible, trying alternative approach...');
        // Try clicking away and back
        await page.click('body');
        await page.waitForTimeout(500);
        await selectTrigger.click();
        await page.waitForTimeout(1000);
        await page.click('text="First Session"');
      }
    }
    
    // Check form validation state
    console.log('🔍 Checking form validation...');
    const formData = await page.evaluate(() => {
      const name = document.querySelector('#name')?.value;
      const price = document.querySelector('#price')?.value;
      const duration = document.querySelector('#duration_minutes')?.value;
      return { name, price, duration };
    });
    console.log('Form data:', formData);
    
    // Try to submit
    console.log('🔍 Testing form submission...');
    const submitButton = page.locator('button:has-text("Add Service")');
    const isSubmitEnabled = await submitButton.isEnabled();
    console.log('Submit button enabled:', isSubmitEnabled);
    
    if (isSubmitEnabled) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      // Check if service was added
      const servicesAdded = await page.locator('text="Your Services"').isVisible();
      console.log('Services section appeared:', servicesAdded);
      
      // Check for any error messages
      const errorMessages = await page.locator('.text-destructive, [role="alert"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('Error messages:', errorMessages);
      }
      
      console.log('✅ Form submission completed');
    } else {
      console.log('❌ Submit button is disabled');
    }
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'debug-form.png', fullPage: true });
    console.log('📸 Debug screenshot saved as debug-form.png');
    
    console.log('🔍 Keeping browser open for manual inspection...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    await page.waitForTimeout(15000);
  }
  
  await browser.close();
}

debugCalculator().catch(console.error);