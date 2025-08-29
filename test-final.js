const { chromium } = require('@playwright/test');

async function testPMUCalculator() {
  const browser = await chromium.launch({ 
    headless: false,  // Keep browser visible so you can watch
    slowMo: 1200     // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 PMU Revenue Calculator - Complete Test with Authentication');
    
    // Authentication
    console.log('🔐 Authenticating with Supabase...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('form button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Authentication successful!');
    
    // Navigate to Calculator
    console.log('📊 Loading PMU Revenue Calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"');
    console.log('✅ Calculator loaded!');
    
    // STEP 1: Service Configuration
    console.log('⚙️ STEP 1: Adding PMU Services...');
    
    // Service 1: Microblading First Session
    console.log('  📝 Adding Microblading First Session...');
    await page.fill('#name', 'Microblading First Session');
    await page.fill('#price', '400');
    await page.fill('#duration_minutes', '180');
    
    // Handle shadcn Select for service type
    await page.click('button[role="combobox"]:near(text="Service Type")');
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.click('[data-value="first_session"], [role="option"]:has-text("First Session")');
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(2000);
    console.log('  ✅ Microblading First Session added');
    
    // Service 2: Touch-up
    console.log('  📝 Adding Touch-up Service...');
    await page.fill('#name', 'Microblading Touch-up');
    await page.fill('#price', '150'); 
    await page.fill('#duration_minutes', '90');
    
    await page.click('button[role="combobox"]:near(text="Service Type")');
    await page.waitForSelector('[role="listbox"]');
    await page.click('[data-value="touch_up"], [role="option"]:has-text("Touch-up")');
    
    // Wait for parent service dropdown to appear
    await page.waitForSelector('text="Parent Service"', { timeout: 3000 });
    await page.click('button[role="combobox"]:below(text="Parent Service")');
    await page.waitForSelector('[role="listbox"]');
    await page.click('[role="option"]:has-text("Microblading First Session")');
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(2000);
    console.log('  ✅ Touch-up service added');
    
    // Navigate to Step 2
    console.log('  ➡️ Moving to Step 2...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    
    // STEP 2: Operating Hours
    console.log('⏰ STEP 2: Setting Operating Hours...');
    await page.fill('#hours_per_week', '40');
    
    // Select working days using shadcn Select
    await page.click('button[role="combobox"]:near(text="Working Days")');
    await page.waitForSelector('[role="listbox"]');
    await page.click('[role="option"]:has-text("5 days")');
    
    await page.click('button:has-text("Save Hours"), button[type="submit"]');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Operating hours configured');
    
    // STEP 3: Revenue Assessment
    console.log('💰 STEP 3: Revenue Assessment...');
    
    // Find booking input fields (they should be numbered inputs)
    const bookingInputs = await page.locator('input[type="number"]:below(text="Monthly Booking Numbers")').all();
    console.log(`  📊 Found ${bookingInputs.length} booking input fields`);
    
    for (let i = 0; i < Math.min(bookingInputs.length, 2); i++) {
      const bookings = [8, 6][i]; // 8 for first service, 6 for touch-up
      await bookingInputs[i].fill(bookings.toString());
      await page.waitForTimeout(800);
      console.log(`  ✅ Set ${bookings} bookings for service ${i + 1}`);
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Revenue assessment completed');
    
    // STEP 4: Preference Rating
    console.log('⭐ STEP 4: Rating Service Preferences...');
    
    // Find star rating containers and click 4th star in each
    const starContainers = await page.locator('div:has(svg.lucide-star)').all();
    console.log(`  ⭐ Found ${starContainers.length} star rating sections`);
    
    for (let i = 0; i < Math.min(starContainers.length, 2); i++) {
      const stars = await starContainers[i].locator('button:has(svg.lucide-star)').all();
      if (stars.length >= 4) {
        await stars[3].click(); // Click 4th star
        await page.waitForTimeout(600);
        console.log(`  ⭐ Rated service ${i + 1} with 4 stars`);
      }
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(2000);
    console.log('✅ Preferences rated');
    
    // STEP 5: Goal Setting & AI Generation
    console.log('🎯 STEP 5: Setting Revenue Goals...');
    await page.fill('#target_revenue', '8000');
    await page.selectOption('select[name="timeline"]', 'monthly');
    console.log('  ✅ Target: $8000/month');
    
    // Generate AI scenarios
    console.log('🤖 STEP 6: Generating AI Scenarios with OpenAI...');
    console.log('  ⏳ This will test your real OpenAI API key...');
    await page.click('button:has-text("Generate AI Scenarios"), button:has-text("Generate")');
    
    // Wait for OpenAI to generate scenarios
    console.log('  🔄 Waiting up to 45 seconds for OpenAI response...');
    await page.waitForSelector('text="Scenario Results", text="Happiness Focused", h3:has-text("scenario")', { 
      timeout: 45000 
    });
    
    console.log('🎉 SUCCESS! PMU Revenue Calculator fully tested!');
    console.log('📊 AI scenarios generated successfully with OpenAI integration');
    console.log('✨ Check the browser window to see the results');
    
    // Take success screenshot
    await page.screenshot({ path: 'pmu-calculator-success.png', fullPage: true });
    console.log('📸 Success screenshot saved as pmu-calculator-success.png');
    
    // Keep browser open for inspection
    console.log('👀 Keeping browser open for 2 minutes to inspect results...');
    await page.waitForTimeout(120000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('🐛 Debug info:');
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    // Try to get current step info
    try {
      const stepHeading = await page.textContent('h3, h2, [data-step]');
      console.log('Current step:', stepHeading);
    } catch (e) {
      console.log('Could not determine current step');
    }
    
    await page.screenshot({ path: 'pmu-calculator-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as pmu-calculator-error.png');
    
    console.log('🔍 Keeping browser open for manual debugging...');
    await page.waitForTimeout(30000);
  }
  
  await browser.close();
}

testPMUCalculator().catch(console.error);