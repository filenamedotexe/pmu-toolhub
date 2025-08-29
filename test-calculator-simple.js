const { chromium } = require('@playwright/test');

async function testCalculatorFromCurrent() {
  const browser = await chromium.launch({ 
    headless: false,  // Keep browser open so you can see
    slowMo: 800      // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Testing PMU Revenue Calculator (starting from current position)...');
    
    // Go directly to calculator
    await page.goto('http://localhost:3000/tool/pmu-revenue-calculator');
    await page.waitForTimeout(3000);
    
    console.log('📍 Calculator loaded');
    
    // Step 1: Add services using the form
    console.log('⚙️ Step 1: Adding services...');
    
    // Look for service form inputs
    const nameInput = await page.locator('input[placeholder*="Microblading"], input#name, input[name="name"]').first();
    const priceInput = await page.locator('input[type="number"]:near(label:has-text("Price")), input[placeholder="400"]').first(); 
    const durationInput = await page.locator('input[type="number"]:near(label:has-text("Duration")), input[placeholder="180"]').first();
    
    if (await nameInput.isVisible({ timeout: 5000 })) {
      // Add first service
      await nameInput.fill('Microblading First Session');
      await priceInput.fill('400');
      await durationInput.fill('180');
      
      // Select service type
      const serviceTypeSelect = await page.locator('select, [role="combobox"]').first();
      if (await serviceTypeSelect.isVisible()) {
        await serviceTypeSelect.click();
        await page.waitForTimeout(500);
        await page.click('text="First Session"');
      }
      
      // Submit form
      await page.click('button:has-text("Add Service")');
      await page.waitForTimeout(2000);
      
      console.log('✅ First service added');
      
      // Add second service
      await nameInput.fill('Microblading Touch-up');
      await priceInput.fill('150');
      await durationInput.fill('90');
      
      await serviceTypeSelect.click();
      await page.waitForTimeout(500);
      await page.click('text="Touch-up"');
      await page.waitForTimeout(500);
      
      // Submit form
      await page.click('button:has-text("Add Service")');
      await page.waitForTimeout(2000);
      
      console.log('✅ Second service added');
    }
    
    // Navigate to next step
    console.log('⏭️ Going to Step 2...');
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForTimeout(2000);
    
    // Step 2: Operating Hours
    console.log('⏰ Step 2: Setting hours...');
    const hoursInput = await page.locator('input[name="hours_per_week"], input[placeholder="40"]').first();
    if (await hoursInput.isVisible({ timeout: 3000 })) {
      await hoursInput.fill('40');
      await page.click('button:has-text("Save Hours"), button[type="submit"]');
      await page.waitForTimeout(2000);
      console.log('✅ Hours saved');
    }
    
    // Continue to Step 3
    console.log('⏭️ Going to Step 3...');
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForTimeout(2000);
    
    // Step 3: Revenue Assessment
    console.log('💰 Step 3: Setting bookings...');
    const bookingInputs = await page.locator('input[type="number"]').all();
    for (let i = 0; i < Math.min(bookingInputs.length, 3); i++) {
      await bookingInputs[i].fill((8 - i * 2).toString()); // 8, 6, 4
      await page.waitForTimeout(500);
    }
    console.log('✅ Bookings set');
    
    // Continue to Step 4
    console.log('⏭️ Going to Step 4...');
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForTimeout(2000);
    
    // Step 4: Preferences (click stars)
    console.log('⭐ Step 4: Rating preferences...');
    const stars = await page.locator('[data-testid*="star"], button:has(svg.lucide-star)').all();
    for (let i = 0; i < Math.min(stars.length, 15); i += 5) {
      try {
        await stars[i + 3].click(); // Click 4th star for each service
        await page.waitForTimeout(400);
      } catch (e) {
        console.log(`ℹ️ Could not click star ${i}`);
      }
    }
    console.log('✅ Preferences rated');
    
    // Continue to Step 5
    console.log('⏭️ Going to Step 5...');
    await page.click('button:has-text("Continue"), button:has-text("Next")');
    await page.waitForTimeout(2000);
    
    // Step 5: Goal Setting
    console.log('🎯 Step 5: Setting revenue goal...');
    const targetInput = await page.locator('input[name="target_revenue"], input[placeholder="5000"]').first();
    if (await targetInput.isVisible({ timeout: 3000 })) {
      await targetInput.fill('8000');
      await page.waitForTimeout(1000);
      console.log('✅ Revenue goal set to $8000');
    }
    
    // Generate scenarios
    console.log('🤖 Generating AI scenarios with OpenAI...');
    await page.click('button:has-text("Generate")');
    
    // Wait for scenarios (this will test the OpenAI integration)
    console.log('⏳ Waiting for AI scenarios (may take 10-30 seconds)...');
    await page.waitForSelector('text="Scenario Results", text="AI scenarios", text="Happiness Focused"', { timeout: 45000 });
    
    console.log('🎉 SUCCESS! PMU Revenue Calculator fully tested with OpenAI integration!');
    console.log('📊 You should now see 3 AI-generated scenarios in the browser');
    
    // Keep browser open so you can see results
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'calculator-debug.png', fullPage: true });
    console.log('📸 Debug screenshot saved as calculator-debug.png');
    
    // Show current URL and page state
    console.log('Current URL:', page.url());
    const title = await page.title();
    console.log('Page title:', title);
    
    await page.waitForTimeout(10000); // Keep browser open for inspection
  }
  
  await browser.close();
}

testCalculatorFromCurrent().catch(console.error);