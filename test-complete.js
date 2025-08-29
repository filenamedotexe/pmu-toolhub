const { chromium } = require('@playwright/test');

async function testCompleteFlow() {
  const browser = await chromium.launch({ 
    headless: false,  // Keep browser visible
    slowMo: 1000     // Slow down actions
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Complete PMU Revenue Calculator Test');
    
    // Step 1: Authentication
    console.log('🔐 Step 1: Authenticating...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    
    // Fill login form with exact selectors
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('form button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Authenticated successfully');
    
    // Step 2: Navigate to Calculator
    console.log('📊 Step 2: Opening PMU Calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"', { timeout: 10000 });
    console.log('✅ Calculator loaded');
    
    // Step 3: Service Configuration
    console.log('⚙️ Step 3: Configuring Services...');
    
    // Add first service - Microblading First Session
    await page.fill('#name', 'Microblading First Session');
    await page.fill('#price', '400');
    await page.fill('#duration_minutes', '180');
    
    // Select service type using shadcn Select
    await page.click('[data-testid="service-type-trigger"], button[role="combobox"]');
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    await page.click('text="First Session"');
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(2000);
    console.log('✅ First service added');
    
    // Add second service - Touch-up
    await page.fill('#name', 'Microblading Touch-up');
    await page.fill('#price', '150');
    await page.fill('#duration_minutes', '90');
    
    await page.click('button[role="combobox"]');
    await page.click('text="Touch-up"');
    
    // Select parent service if dropdown appears
    try {
      await page.waitForSelector('text="Parent Service"', { timeout: 2000 });
      await page.click('button[role="combobox"]:below(text="Parent Service")');
      await page.click('[role="option"]:has-text("Microblading First Session")');
    } catch (e) {
      console.log('ℹ️ Parent service selection not needed');
    }
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(2000);
    console.log('✅ Second service added');
    
    // Navigate to Step 2
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Moved to Operating Hours');
    
    // Step 4: Operating Hours
    console.log('⏰ Step 4: Setting Operating Hours...');
    await page.fill('#hours_per_week', '40');
    
    // Select working days
    await page.click('button[role="combobox"]:near(text="Working Days")');
    await page.click('text="5 days"');
    
    await page.click('button:has-text("Save Hours")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Operating hours set, moved to Revenue Assessment');
    
    // Step 5: Revenue Assessment
    console.log('💰 Step 5: Revenue Assessment...');
    
    // Fill booking numbers (should be input fields for each service)
    const bookingInputs = await page.locator('input[type="number"]:below(text="Monthly Booking Numbers")').all();
    if (bookingInputs.length >= 2) {
      await bookingInputs[0].fill('8');  // First service bookings
      await page.waitForTimeout(500);
      await bookingInputs[1].fill('6');  // Second service bookings
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Revenue assessment completed');
    
    // Step 6: Preference Rating
    console.log('⭐ Step 6: Rating Preferences...');
    
    // Click star ratings (look for star buttons)
    const starContainers = await page.locator('div:has(svg.lucide-star)').all();
    for (let i = 0; i < Math.min(starContainers.length, 2); i++) {
      // Click 4th star in each container
      const stars = await starContainers[i].locator('button:has(svg.lucide-star)').all();
      if (stars.length >= 4) {
        await stars[3].click(); // 4th star (index 3)
        await page.waitForTimeout(500);
      }
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Preferences rated');
    
    // Step 7: Goal Setting
    console.log('🎯 Step 7: Setting Revenue Goals...');
    await page.fill('#target_revenue', '8000');
    
    // Select timeline
    await page.selectOption('select[name="timeline"]', 'monthly');
    
    // Generate scenarios with OpenAI
    console.log('🤖 Step 8: Generating AI Scenarios...');
    await page.click('button:has-text("Generate AI Scenarios"), button:has-text("Generate")');
    
    // Wait for AI generation (this tests the OpenAI integration)
    console.log('⏳ Waiting for OpenAI to generate scenarios (30s timeout)...');
    await page.waitForSelector('text="Scenario Results", text="Happiness Focused", text="scenarios"', { 
      timeout: 35000 
    });
    
    console.log('🎉 SUCCESS! Complete flow tested with OpenAI integration!');
    console.log('📊 Check the browser to see the AI-generated scenarios');
    
    // Take final screenshot
    await page.screenshot({ path: 'calculator-success.png', fullPage: true });
    console.log('📸 Success screenshot saved');
    
    // Keep browser open to inspect results
    console.log('🔍 Keeping browser open for 60 seconds to inspect results...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Test failed at:', error.message);
    
    // Debug info
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Take error screenshot  
    await page.screenshot({ path: 'calculator-error-complete.png', fullPage: true });
    console.log('📸 Error screenshot saved');
    
    // Show page content for debugging
    try {
      const stepText = await page.textContent('h3, h2, [role="heading"]');
      console.log('Current step heading:', stepText);
    } catch (e) {
      console.log('Could not find step heading');
    }
    
    await page.waitForTimeout(15000);
  }
  
  await browser.close();
}

testCompleteFlow().catch(console.error);