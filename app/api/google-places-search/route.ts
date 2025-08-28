import { PlacesApi, AutocompletePrediction } from '@googlemaps/places'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Check if Google Places API key is configured
    if (!process.env.GOOGLE_PLACES_API_KEY) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const { query, sessionToken } = await request.json()
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Initialize Places API client
    const placesApi = new PlacesApi({
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
    })

    // Search for businesses using autocomplete
    const autocompleteRequest = {
      input: query.trim(),
      sessionToken: sessionToken || undefined,
      types: ['establishment'],
      fields: ['place_id', 'name', 'formatted_address', 'business_status', 'types'],
      // Bias results towards business establishments
      locationBias: undefined, // Can be set based on user location if available
    }

    const response = await placesApi.searchText({
      textQuery: query.trim(),
      fields: ['places.id', 'places.displayName', 'places.formattedAddress', 'places.businessStatus', 'places.types'],
    })

    // Format the response for frontend consumption
    const suggestions = response.data.places?.map(place => ({
      place_id: place.id,
      name: place.displayName?.text || 'Unknown Business',
      formatted_address: place.formattedAddress || 'Address not available',
      business_status: place.businessStatus,
      types: place.types || []
    })) || []

    return NextResponse.json({
      suggestions,
      sessionToken: sessionToken // Return session token for continued use
    })

  } catch (error: any) {
    console.error('Google Places API error:', error)
    
    // Handle specific Google API errors
    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request to Google Places API' },
        { status: 400 }
      )
    }
    
    if (error.response?.status === 403) {
      return NextResponse.json(
        { error: 'Google Places API access denied. Check API key and billing.' },
        { status: 403 }
      )
    }
    
    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for Google Places API' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    )
  }
}