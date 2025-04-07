export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get form data from request body - extract from fields if present
    const data = req.body;
    const fields = data.fields || data;
    
    // Extract the form data using the correct field names
    const name = fields['Full Name'] || fields.name || '';
    const email = fields['Email'] || fields.email || '';
    const useCase = fields['Use Case'] || fields.useCase || '';
    
    // Log the received data for debugging
    console.log('Received form data:', { name, email, useCase });
    
    // Get API key from environment variables
    const airtableToken = process.env.AIRTABLE_PAT;
    
    // Check if API key exists
    if (!airtableToken) {
      console.error('Airtable PAT not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Send data to Airtable with exact column names from your Airtable
    const response = await fetch('https://api.airtable.com/v0/appypzFNhpw3sx6YV/tblm2iJo6J4nFsZWD', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "Full Name": name,
          "Email": email,
          "Use Case": useCase || 'Not specified'
        }
      })
    });
    
    // Check if Airtable request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      return res.status(500).json({ error: 'Failed to submit to Airtable', details: errorData });
    }
    
    const responseData = await response.json();
    console.log('Airtable success response:', responseData);
    
    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in API route:', error.message);
    return res.status(500).json({ error: 'Failed to submit form', message: error.message });
  }
} 