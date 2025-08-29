import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Mock business suggestions for demo purposes
    const mockSuggestions = [
      {
        place_id: 'mock_place_1',
        name: `${query.trim()} - Main Location`,
        formatted_address: '123 Main St, City, State 12345',
        business_status: 'OPERATIONAL',
        types: ['establishment', 'store']
      },
      {
        place_id: 'mock_place_2', 
        name: `${query.trim()} - Downtown Branch`,
        formatted_address: '456 Downtown Ave, City, State 12345',
        business_status: 'OPERATIONAL',
        types: ['establishment', 'store']
      },
      {
        place_id: 'mock_place_3',
        name: `${query.trim()} - Shopping Center`,
        formatted_address: '789 Shopping Center Blvd, City, State 12345',
        business_status: 'OPERATIONAL',
        types: ['establishment', 'store']
      }
    ]

    return NextResponse.json({
      suggestions: mockSuggestions
    })

  } catch (error: unknown) {
    console.error('Google Places API error:', error)
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    )
  }
}