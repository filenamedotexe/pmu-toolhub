const { chromium } = require('@playwright/test');

async function testCalculator() {
  const browser = await chromium.launch({ 
    headless: false,  // Keep browser open so you can see the flow
    slowMo: 500      // Slow down actions for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting PMU Revenue Calculator Test...');
    
    // Step 1: Navigate to home and check if authenticated
    console.log('🔐 Checking authentication status...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Check if we need to log in
    const loginButton = await page.locator('text="Sign In", text="Login", a[href*="auth"]').first();
    if (await loginButton.isVisible({ timeout: 3000 })) {
      console.log('🔑 Not authenticated, going to login...');
      
      // Go to login page
      await page.goto('http://localhost:3000/auth/login');
      await page.waitForTimeout(2000);
      
      // Check if there are email/password fields
      const emailField = await page.locator('input[type="email"], input[name="email"]').first();
      const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailField.isVisible({ timeout: 2000 }) && await passwordField.isVisible({ timeout: 2000 })) {
        console.log('📧 Logging in with email/password...');
        await emailField.fill('admin@test.com');
        await passwordField.fill('admin123');
        
        // Click login button
        await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
        await page.waitForTimeout(3000);
        
        // Wait for dashboard
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('✅ Authentication successful!');
      } else {
        console.log('ℹ️ Please authenticate manually in the browser window that opened');
        console.log('ℹ️ Use admin@test.com / admin123 or its.zach.w@gmail.com');
        console.log('ℹ️ After logging in, the test will continue automatically...');
        
        // Wait for authentication to complete (user will see dashboard)
        await page.waitForURL('**/dashboard', { timeout: 60000 });
        console.log('✅ Authentication successful!');
      }
    } else {
      console.log('✅ Already authenticated');
    }
    
    // Step 2: Navigate to calculator via unlock URL
    console.log('🔓 Unlocking PMU Revenue Calculator...');
    await page.goto('http://localhost:3000/unlock/pmu-revenue-calculator');
    await page.waitForTimeout(2000);
    
    // Should redirect to calculator tool
    console.log('📍 Navigating to calculator tool...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForTimeout(3000);
    
    // Wait for the calculator to load
    await page.waitForSelector('h1:has-text("PMU Revenue Calculator"), [title*="PMU"], .space-y-6', { timeout: 10000 });
    console.log('✅ Calculator loaded successfully');
    
    // Step 1: Service Configuration
    console.log('⚙️ Step 1: Adding services...');
    
    // Add Microblading First Session
    await page.fill('input[name="name"]', 'Microblading First Session');
    await page.fill('input[name="price"]', '400');
    await page.fill('input[name="duration_minutes"]', '180');
    await page.selectOption('select[name="service_type"]', 'first_session');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    // Add Microblading Touch-up
    await page.fill('input[name="name"]', 'Microblading Touch-up');
    await page.fill('input[name="price"]', '150');
    await page.fill('input[name="duration_minutes"]', '90');
    await page.selectOption('select[name="service_type"]', 'touch_up');
    await page.waitForTimeout(500);
    // Select parent service if dropdown appears
    try {
      await page.selectOption('select[name="parent_service_id"]', { index: 0 });
    } catch (e) {
      console.log('ℹ️ Parent service selection not needed or not found');
    }
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    // Add Powder Brow
    await page.fill('input[name="name"]', 'Powder Brow First Session');
    await page.fill('input[name="price"]', '450');
    await page.fill('input[name="duration_minutes"]', '180');
    await page.selectOption('select[name="service_type"]', 'first_session');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    
    console.log('✅ Services added successfully');
    
    // Navigate to Step 2
    console.log('⏰ Step 2: Setting operating hours...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Fill operating hours
    await page.fill('input[name="hours_per_week"]', '40');
    await page.selectOption('select[name="working_days_per_week"]', '5');
    await page.click('button:has-text("Save Hours"), button[type="submit"]');
    await page.waitForTimeout(1500);
    
    console.log('✅ Operating hours set');
    
    // Navigate to Step 3
    console.log('💰 Step 3: Setting revenue assessment...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Fill current bookings for each service
    const bookingInputs = await page.locator('input[type="number"]').all();
    if (bookingInputs.length >= 3) {
      await bookingInputs[0].fill('8');  // Microblading first sessions
      await page.waitForTimeout(500);
      await bookingInputs[1].fill('6');  // Touch-ups  
      await page.waitForTimeout(500);
      await bookingInputs[2].fill('4');  // Powder brows
      await page.waitForTimeout(500);
    }
    
    console.log('✅ Revenue assessment completed');
    
    // Navigate to Step 4
    console.log('⭐ Step 4: Rating preferences...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Rate preferences (click on 4th star for each service)
    const starButtons = await page.locator('button:has(svg)').filter({ hasText: /★|Star/ }).all();
    for (let i = 0; i < Math.min(starButtons.length, 9); i += 5) {
      try {
        await starButtons[i + 3].click(); // Click 4th star (index 3)
        await page.waitForTimeout(300);
      } catch (e) {
        console.log(`ℹ️ Could not click star button ${i}`);
      }
    }
    
    console.log('✅ Preferences rated');
    
    // Navigate to Step 5
    console.log('🎯 Step 5: Setting goals...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    
    // Set revenue goal
    await page.fill('input[name="target_revenue"]', '8000');
    await page.waitForTimeout(500);
    
    console.log('✅ Goals set');
    
    // Generate scenarios
    console.log('🤖 Generating AI scenarios...');
    await page.click('button:has-text("Generate")');
    
    // Wait for scenarios to generate (may take a while with OpenAI)
    await page.waitForSelector('text="Scenario Results", text="AI scenarios"', { timeout: 30000 });
    console.log('✅ AI scenarios generated successfully!');
    
    await page.waitForTimeout(5000); // Keep browser open to view results
    
    console.log('🎉 PMU Revenue Calculator test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'calculator-error.png', fullPage: true });
    console.log('📸 Screenshot saved as calculator-error.png');
    
    // Log current page content for debugging
    const content = await page.textContent('body');
    console.log('Page content:', content?.substring(0, 500) + '...');
  }
  
  console.log('🔍 Keeping browser open for inspection...');
  // Keep browser open for manual inspection
  await page.waitForTimeout(30000);
  
  await browser.close();
}

testCalculator().catch(console.error);