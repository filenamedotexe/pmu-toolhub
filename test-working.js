const { chromium } = require('@playwright/test');

async function testPMUCalculatorWorking() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null // Use full screen
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 PMU Revenue Calculator - WORKING Test');
    
    // Step 1: Authentication
    console.log('🔐 Step 1: Authenticating...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Logged in successfully');
    
    // Step 2: Open Calculator
    console.log('📊 Step 2: Opening Calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"');
    console.log('✅ Calculator opened');
    
    // Step 3: Add First Service
    console.log('⚙️ Step 3: Adding Services...');
    
    console.log('  📝 Adding Microblading First Session...');
    await page.fill('#name', 'Microblading First Session');
    await page.fill('#price', '400');
    await page.fill('#duration_minutes', '180');
    
    // Click the Select trigger button (avoid complex selectors)
    const selectTriggers = await page.locator('button[role="combobox"]').all();
    if (selectTriggers.length > 0) {
      await selectTriggers[0].click();
      await page.waitForTimeout(1000);
      
      // Click the First Session option
      await page.click('text="First Session"');
      await page.waitForTimeout(1000);
    }
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(3000);
    console.log('  ✅ First service added');
    
    // Add second service
    console.log('  📝 Adding Touch-up Service...');
    await page.fill('#name', 'Microblading Touch-up');
    await page.fill('#price', '150');
    await page.fill('#duration_minutes', '90');
    
    // Select Touch-up type
    const selectTriggers2 = await page.locator('button[role="combobox"]').all();
    if (selectTriggers2.length > 0) {
      await selectTriggers2[0].click();
      await page.waitForTimeout(1000);
      await page.click('text="Touch-up"');
      await page.waitForTimeout(1000);
    }
    
    // Check if parent service dropdown appeared
    const parentSelects = await page.locator('button[role="combobox"]').all();
    if (parentSelects.length > 1) {
      await parentSelects[1].click();
      await page.waitForTimeout(1000);
      await page.click('text="Microblading First Session"');
      await page.waitForTimeout(1000);
    }
    
    await page.click('button:has-text("Add Service")');
    await page.waitForTimeout(3000);
    console.log('  ✅ Second service added');
    
    // Navigate to Step 2
    console.log('➡️ Moving to Step 2: Operating Hours...');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);
    
    // Step 4: Operating Hours
    console.log('⏰ Step 4: Setting Operating Hours...');
    await page.fill('#hours_per_week', '40');
    
    // Select working days
    const workingDaysSelect = await page.locator('button[role="combobox"]').first();
    await workingDaysSelect.click();
    await page.waitForTimeout(1000);
    await page.click('text="5 days"');
    
    await page.click('button:has-text("Save Hours")');
    await page.waitForTimeout(3000);
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);
    console.log('✅ Operating hours set');
    
    // Step 5: Revenue Assessment
    console.log('💰 Step 5: Setting Current Revenue...');
    
    // Fill booking numbers - look for number inputs
    const numberInputs = await page.locator('input[type="number"]').all();
    console.log(`Found ${numberInputs.length} number inputs`);
    
    // Fill the booking inputs (skip first few which might be from previous forms)
    for (let i = Math.max(0, numberInputs.length - 3); i < numberInputs.length; i++) {
      const bookingValue = i === numberInputs.length - 2 ? '8' : '6';
      await numberInputs[i].fill(bookingValue);
      await page.waitForTimeout(1000);
      console.log(`  📊 Set bookings: ${bookingValue}`);
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);
    console.log('✅ Revenue assessment completed');
    
    // Step 6: Preferences
    console.log('⭐ Step 6: Rating Preferences...');
    
    // Click star buttons - find all star SVGs and click their parent buttons
    const starButtons = await page.locator('button:has(svg.lucide-star)').all();
    console.log(`Found ${starButtons.length} star buttons`);
    
    // Click 4th star for each service (assumes 5 stars per service)
    for (let i = 3; i < Math.min(starButtons.length, 13); i += 5) {
      await starButtons[i].click();
      await page.waitForTimeout(800);
      console.log(`  ⭐ Clicked star button ${i}`);
    }
    
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(3000);
    console.log('✅ Preferences set');
    
    // Step 7: Goal Setting and AI
    console.log('🎯 Step 7: Setting Goals...');
    await page.fill('#target_revenue', '8000');
    
    console.log('🤖 Step 8: Generating AI Scenarios...');
    console.log('⏳ Testing OpenAI integration...');
    await page.click('button:has-text("Generate")');
    
    // Wait for AI scenarios
    await page.waitForSelector('text="Happiness Focused", text="Efficiency Focused", text="Balanced"', { 
      timeout: 60000 
    });
    
    console.log('🎉 SUCCESS! Complete PMU Calculator test with OpenAI!');
    console.log('📈 AI scenarios generated successfully');
    
    await page.screenshot({ path: 'success-final.png', fullPage: true });
    console.log('📸 Final success screenshot saved');
    
    // Keep browser open
    console.log('👀 Browser staying open for inspection...');
    await page.waitForTimeout(180000); // 3 minutes
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    await page.screenshot({ path: 'debug-final.png', fullPage: true });
    console.log('📸 Debug screenshot saved');
    console.log('URL:', page.url());
    
    await page.waitForTimeout(30000);
  }
  
  await browser.close();
}

testPMUCalculatorWorking().catch(console.error);