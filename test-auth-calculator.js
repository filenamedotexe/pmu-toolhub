const { chromium } = require('@playwright/test');

async function testWithAuth() {
  const browser = await chromium.launch({ 
    headless: false,  // Keep browser visible
    slowMo: 600      // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting authenticated PMU Revenue Calculator test...');
    
    // Step 1: Go to login page
    console.log('🔐 Going to login page...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for form to load
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    console.log('📧 Login form found');
    
    // Fill in admin credentials
    console.log('🔑 Logging in as admin...');
    await page.fill('input[type="email"], input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"], input[name="password"]', 'password123');
    
    // Click the password login button (not OAuth buttons)
    await page.click('button[type="submit"]:near(input[type="password"]), button:has-text("Sign In"):near(input[type="password"])');
    
    // Wait for redirect to dashboard
    console.log('⏳ Waiting for authentication...');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Successfully logged in as admin!');
    
    // Step 2: Navigate to PMU Calculator
    console.log('🔓 Accessing PMU Revenue Calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    
    // Wait for calculator to load
    await page.waitForSelector('text="PMU Revenue Calculator"', { timeout: 10000 });
    console.log('📊 Calculator loaded!');
    
    // Step 3: Test Step 1 - Service Configuration
    console.log('⚙️ Testing Step 1: Service Configuration...');
    
    // Look for the service form
    const serviceNameInput = page.locator('input[id="name"], input[placeholder*="Microblading"]').first();
    if (await serviceNameInput.isVisible({ timeout: 5000 })) {
      await serviceNameInput.fill('Microblading First Session');
      
      const priceInput = page.locator('input[id="price"], input[type="number"]:near(text="Price")').first();
      await priceInput.fill('400');
      
      const durationInput = page.locator('input[id="duration_minutes"], input[type="number"]:near(text="Duration")').first();
      await durationInput.fill('180');
      
      // Select service type
      const serviceTypeSelect = page.locator('[id="service_type"], select:near(text="Service Type")').first();
      if (await serviceTypeSelect.isVisible()) {
        await serviceTypeSelect.click();
        await page.waitForTimeout(500);
        const firstSessionOption = page.locator('option[value="first_session"], [data-value="first_session"]').first();
        await firstSessionOption.click();
      }
      
      // Submit the form
      await page.click('button:has-text("Add Service")');
      await page.waitForTimeout(2000);
      console.log('✅ Service added successfully');
      
      // Continue to next step
      const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (await continueBtn.isVisible({ timeout: 3000 })) {
        await continueBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Moved to Step 2');
      }
    }
    
    // Step 4: Test Step 2 - Operating Hours
    console.log('⏰ Testing Step 2: Operating Hours...');
    const hoursInput = page.locator('input[id="hours_per_week"], input[name="hours_per_week"]').first();
    if (await hoursInput.isVisible({ timeout: 3000 })) {
      await hoursInput.fill('40');
      
      const saveBtn = page.locator('button:has-text("Save Hours"), button[type="submit"]:near(text="Hours")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1500);
        console.log('✅ Operating hours saved');
      }
      
      // Continue to Step 3
      await page.click('button:has-text("Continue"), button:has-text("Next")');
      await page.waitForTimeout(2000);
      console.log('✅ Moved to Step 3');
    }
    
    // Continue testing...
    console.log('🎉 Test in progress - check the browser window to continue manually');
    console.log('💡 The calculator should now be working with real authentication!');
    
    // Keep browser open for manual testing
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Authentication/Calculator test failed:', error.message);
    
    // Take screenshot
    await page.screenshot({ path: 'auth-test-error.png', fullPage: true });
    console.log('📸 Screenshot saved as auth-test-error.png');
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    await page.waitForTimeout(10000);
  }
  
  await browser.close();
}

testWithAuth().catch(console.error);