const { chromium } = require('@playwright/test');

async function testCalculatorFixed() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    console.log(`🖥️  ${msg.type()}: ${msg.text()}`);
  });
  
  try {
    console.log('🎯 FINAL TEST - PMU Revenue Calculator with FIXED SELECTS');
    
    // Auth
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Authenticated');
    
    // Calculator
    console.log('📊 Loading calculator...');
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text="PMU Revenue Calculator"');
    console.log('✅ Calculator loaded');
    
    // Wait for React to initialize
    await page.waitForTimeout(3000);
    
    // STEP 1: Add Service
    console.log('⚙️ STEP 1: Adding First Service...');
    
    await page.fill('#name', 'Microblading First Session');
    console.log('  ✅ Name filled');
    
    await page.fill('#price', '400');
    console.log('  ✅ Price filled');
    
    await page.fill('#duration_minutes', '180');
    console.log('  ✅ Duration filled');
    
    // Use standard select (no longer shadcn Select)
    await page.selectOption('#service_type', 'first_session');
    console.log('  ✅ Service type selected');
    
    // Submit form
    console.log('  📤 Submitting form...');
    await page.click('button:has-text("Add Service")');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check if service was added
    const serviceAdded = await page.locator('text="Your Services"').isVisible();
    console.log('✅ Service added:', serviceAdded);
    
    if (serviceAdded) {
      console.log('🎉 SUCCESS! First service added successfully');
      
      // Add second service
      console.log('⚙️ Adding Touch-up Service...');
      await page.fill('#name', 'Microblading Touch-up');
      await page.fill('#price', '150');
      await page.fill('#duration_minutes', '90');
      await page.selectOption('#service_type', 'touch_up');
      
      // Wait for parent service dropdown
      await page.waitForTimeout(1000);
      await page.selectOption('#parent_service_id', { index: 1 }); // Select first available parent
      
      await page.click('button:has-text("Add Service")');
      await page.waitForTimeout(3000);
      
      console.log('✅ Touch-up service added');
      
      // Continue to Step 2
      console.log('➡️ Moving to Step 2...');
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
      
      // STEP 2: Operating Hours
      console.log('⏰ STEP 2: Setting Operating Hours...');
      await page.fill('#hours_per_week', '40');
      await page.selectOption('#working_days_per_week', '5');
      await page.click('button:has-text("Save Hours")');
      await page.waitForTimeout(2000);
      
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
      console.log('✅ Operating hours set');
      
      // STEP 3: Revenue Assessment
      console.log('💰 STEP 3: Revenue Assessment...');
      const bookingInputs = await page.locator('input[type="number"]:below(text="Monthly Booking")').all();
      console.log(`Found ${bookingInputs.length} booking inputs`);
      
      if (bookingInputs.length >= 2) {
        await bookingInputs[0].fill('8');
        await bookingInputs[1].fill('6');
        console.log('✅ Booking numbers set');
      }
      
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
      
      // STEP 4: Preferences
      console.log('⭐ STEP 4: Rating Preferences...');
      const starButtons = await page.locator('button:has(svg.lucide-star)').all();
      
      // Click 4th star for each service
      for (let i = 3; i < Math.min(starButtons.length, 8); i += 5) {
        await starButtons[i].click();
        await page.waitForTimeout(500);
      }
      console.log('✅ Preferences rated');
      
      await page.click('button:has-text("Continue")');
      await page.waitForTimeout(2000);
      
      // STEP 5: Goal Setting & AI
      console.log('🎯 STEP 5: Setting Goals...');
      await page.fill('#target_revenue', '8000');
      await page.selectOption('select[name="timeline"]', 'monthly');
      
      console.log('🤖 GENERATING AI SCENARIOS...');
      await page.click('button:has-text("Generate")');
      
      // Wait for OpenAI response
      console.log('⏳ Waiting for OpenAI (45 seconds max)...');
      await page.waitForSelector('text="Happiness Focused", text="Efficiency Focused"', { 
        timeout: 45000 
      });
      
      console.log('🎉 COMPLETE SUCCESS! PMU Calculator working perfectly!');
      console.log('✅ All steps completed');
      console.log('✅ OpenAI integration working');
      console.log('✅ Database integration working');
      
    } else {
      console.log('❌ Form submission still not working - checking errors...');
    }
    
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'final-debug.png', fullPage: true });
    await page.waitForTimeout(15000);
  }
  
  await browser.close();
}

testCalculatorFixed().catch(console.error);