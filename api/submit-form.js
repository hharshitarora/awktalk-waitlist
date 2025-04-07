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
    console.log('Received form data:', { name, email, useCase, rawBody: req.body });
    
    // Send data to Airtable with exact column names from your Airtable
    const response = await fetch('https://api.airtable.com/v0/appypzFNhpw3sx6YV/tblm2iJo6J4nFsZWD', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat3mxeEAYtwRZGdU.0c273fdd548452c00084c7c3c586c0ad171dd20ed0caa2c8886288e6f9491c95',
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