import { NextResponse } from 'next/server';

// WARNING: Hardcoding URLs is not a secure practice.
// It's recommended to use environment variables to protect sensitive information.
const JSONBLOB_API_URL = 'https://jsonblob.com/api/jsonBlob/1420617466761109504';

if (!JSONBLOB_API_URL || JSONBLOB_API_URL === 'YOUR_JSONBLOB_API_URL_HERE') {
  throw new Error("JSONBLOB_API_URL is not set in src/app/api/data/route.ts. Please replace the placeholder with your actual URL.");
}

// Set revalidate to 0 to disable caching
export const revalidate = 0;

export async function GET() {
  try {
    const response = await fetch(JSONBLOB_API_URL, {
        next: { revalidate: 0 } // No caching for GET requests
    });
    if (!response.ok) {
        return NextResponse.json({ message: 'Failed to fetch data from JSONBlob' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(JSONBLOB_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('JSONBlob PUT Error:', errorText);
        return NextResponse.json({ message: 'Failed to update data in JSONBlob' }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API PUT Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
