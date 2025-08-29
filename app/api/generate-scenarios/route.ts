import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { session_id, target_revenue } = await request.json();

    if (!session_id || !target_revenue) {
      return NextResponse.json(
        { error: 'Session ID and target revenue are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get session data
    const { data: session } = await supabase
      .from('calculator_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get services and operating hours
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('session_id', session_id);

    const { data: operatingHours } = await supabase
      .from('operating_hours')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: 'No services found for this session' },
        { status: 400 }
      );
    }

    if (!operatingHours) {
      return NextResponse.json(
        { error: 'Operating hours not configured' },
        { status: 400 }
      );
    }

    // Calculate current revenue
    const currentRevenue = services.reduce((total, service) => {
      return total + (service.price * service.current_monthly_bookings);
    }, 0);

    // Generate scenarios with OpenAI
    const prompt = `You are a PMU business optimization expert. Generate 3 distinct revenue scenarios based on the following data:

CURRENT SITUATION:
- Current Monthly Revenue: $${currentRevenue}
- Target Monthly Revenue: $${target_revenue}
- Available Weekly Hours: ${operatingHours.hours_per_week}
- Working Days: ${operatingHours.working_days_per_week}

SERVICES:
${services.map(s => `- ${s.name}: $${s.price}, ${s.duration_minutes}min, Current: ${s.current_monthly_bookings}/month, Preference: ${s.preference_rating}/5`).join('\n')}

CONSTRAINTS:
- Maximum ${operatingHours.hours_per_week} hours per week
- Service dependencies must be maintained (touch-ups need first sessions)
- Respect preference ratings (higher rated = more priority)
- Realistic booking increases (max 3x current volume per service)
- Consider capacity constraints for each service duration

REQUIRED OUTPUT FORMAT (JSON):
{
  "scenarios": [
    {
      "name": "Happiness Optimized",
      "type": "preference_optimized",
      "target_revenue": ${target_revenue},
      "total_weekly_hours": number,
      "happiness_score": number (1-5),
      "scenario_data": {
        "services": [
          {
            "service_name": "string",
            "monthly_bookings": number,
            "revenue_contribution": number,
            "hours_contribution": number
          }
        ],
        "summary": {
          "monthly_revenue": number,
          "weekly_hours": number,
          "revenue_per_hour": number,
          "happiness_score": number
        }
      }
    },
    {
      "name": "Efficiency Optimized", 
      "type": "efficiency_optimized",
      "target_revenue": ${target_revenue},
      "total_weekly_hours": number,
      "happiness_score": number,
      "scenario_data": { /* same structure */ }
    },
    {
      "name": "Balanced Growth",
      "type": "balanced_growth", 
      "target_revenue": ${target_revenue},
      "total_weekly_hours": number,
      "happiness_score": number,
      "scenario_data": { /* same structure */ }
    }
  ]
}

Generate realistic, achievable scenarios that:
1. Preference Optimized: Prioritizes high-rated services (4-5 stars) for maximum happiness
2. Efficiency Optimized: Maximizes revenue per hour worked
3. Balanced Growth: Proportional growth across services with good work-life balance

Ensure all scenarios stay within the weekly hour constraints and provide practical booking targets.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    let generatedScenarios;
    try {
      generatedScenarios = JSON.parse(responseContent);
    } catch {
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Save scenarios to database
    const scenariosToInsert = generatedScenarios.scenarios.map((scenario: {
      name: string;
      type: string;
      target_revenue: number;
      total_weekly_hours?: number;
      happiness_score?: number;
      scenario_data: Record<string, unknown>;
    }) => ({
      session_id,
      name: scenario.name,
      type: scenario.type,
      target_revenue: scenario.target_revenue,
      total_weekly_hours: scenario.total_weekly_hours,
      happiness_score: scenario.happiness_score,
      scenario_data: scenario.scenario_data
    }));

    // Delete existing scenarios for this session
    await supabase
      .from('scenarios')
      .delete()
      .eq('session_id', session_id);

    // Insert new scenarios
    const { data: savedScenarios, error: scenarioError } = await supabase
      .from('scenarios')
      .insert(scenariosToInsert)
      .select();

    if (scenarioError) {
      throw scenarioError;
    }

    return NextResponse.json({
      scenarios: savedScenarios,
      generation_time: Date.now()
    });

  } catch (error) {
    console.error('Error generating scenarios:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenarios' },
      { status: 500 }
    );
  }
}