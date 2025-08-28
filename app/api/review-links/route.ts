import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's review links data
    const { data: reviewLinks, error } = await supabase
      .from('review_links')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no data found, return default structure
    if (!reviewLinks) {
      return NextResponse.json({
        gmbBusinessName: null,
        gmbPlaceId: null,
        gmbReviewLink: null,
        gmbCompleted: false,
        facebookPageName: null,
        facebookReviewLink: null,
        facebookCompleted: false
      })
    }

    // Return formatted data
    return NextResponse.json({
      gmbBusinessName: reviewLinks.gmb_business_name,
      gmbPlaceId: reviewLinks.gmb_place_id,
      gmbReviewLink: reviewLinks.gmb_review_link,
      gmbCompleted: reviewLinks.gmb_completed,
      facebookPageName: reviewLinks.facebook_page_name,
      facebookReviewLink: reviewLinks.facebook_review_link,
      facebookCompleted: reviewLinks.facebook_completed
    })

  } catch (error) {
    console.error('Error fetching review links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    
    // Prepare data for database (convert camelCase to snake_case)
    const updateData: any = {
      user_id: user.id
    }
    
    if (body.gmbBusinessName !== undefined) updateData.gmb_business_name = body.gmbBusinessName
    if (body.gmbPlaceId !== undefined) updateData.gmb_place_id = body.gmbPlaceId
    if (body.gmbReviewLink !== undefined) updateData.gmb_review_link = body.gmbReviewLink
    if (body.gmbCompleted !== undefined) updateData.gmb_completed = body.gmbCompleted
    if (body.facebookPageName !== undefined) updateData.facebook_page_name = body.facebookPageName
    if (body.facebookReviewLink !== undefined) updateData.facebook_review_link = body.facebookReviewLink
    if (body.facebookCompleted !== undefined) updateData.facebook_completed = body.facebookCompleted

    // Upsert the data (insert or update based on user_id unique constraint)
    const { data, error } = await supabase
      .from('review_links')
      .upsert(updateData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return formatted data
    return NextResponse.json({
      gmbBusinessName: data.gmb_business_name,
      gmbPlaceId: data.gmb_place_id,
      gmbReviewLink: data.gmb_review_link,
      gmbCompleted: data.gmb_completed,
      facebookPageName: data.facebook_page_name,
      facebookReviewLink: data.facebook_review_link,
      facebookCompleted: data.facebook_completed
    })

  } catch (error) {
    console.error('Error saving review links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}