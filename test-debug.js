const { chromium } = require('@playwright/test');

async function debugFormSubmission() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture all console logs
  page.on('console', msg => {
    console.log(`🖥️  ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log('🚨 PAGE ERROR:', error.toString());
  });
  
  try {
    console.log('🔍 DEBUGGING FORM SUBMISSION');
    
    // Auth
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Authenticated');
    
    // Open calculator
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"');
    console.log('✅ Calculator loaded');
    
    // Wait a bit for React to initialize
    await page.waitForTimeout(3000);
    
    // Fill form and test submission
    console.log('📝 Testing form submission...');
    
    await page.fill('#name', 'Debug Service');
    await page.fill('#price', '200');
    await page.fill('#duration_minutes', '120');
    
    // Select service type
    console.log('🔍 Selecting service type...');
    const selectTrigger = page.locator('button[role="combobox"]').first();
    await selectTrigger.click();
    await page.waitForTimeout(1000);
    await page.click('[data-value="first_session"]');
    await page.waitForTimeout(1000);
    
    // Submit form
    console.log('🔍 Submitting form...');
    await page.click('button:has-text("Add Service")');
    
    // Wait for response and check results
    await page.waitForTimeout(5000);
    
    // Check if service appeared
    const serviceAdded = await page.locator('text="Your Services"').isVisible();
    console.log('✅ Service added:', serviceAdded);
    
    if (!serviceAdded) {
      console.log('❌ Service not added - checking for errors...');
      
      // Check for error messages
      const errors = await page.locator('.text-destructive').allTextContents();
      console.log('Error messages:', errors);
      
      // Check network tab for failed requests
      console.log('🔍 Check Network tab in DevTools for failed requests');
    }
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.waitForTimeout(10000);
  }
  
  await browser.close();
}

debugFormSubmission().catch(console.error);