export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get form data from request body
    const { name, email, useCase } = req.body;
    
    // Log the received data for debugging
    console.log('Received form data:', { name, email, useCase });
    
    // First, let's check the exact field names in Airtable by making a GET request
    const getTableSchema = await fetch('https://api.airtable.com/v0/meta/bases/appypzFNhpw3sx6YV/tables', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer pat3mxeEAYtwRZGdU.0c273fdd548452c00084c7c3c586c0ad171dd20ed0caa2c8886288e6f9491c95',
      }
    });
    
    if (getTableSchema.ok) {
      const schemaData = await getTableSchema.json();
      console.log('Table schema:', JSON.stringify(schemaData, null, 2));
    }
    
    // Send data to Airtable with field names that match exactly what's in Airtable
    // Using lowercase field names as a common convention in Airtable
    const response = await fetch('https://api.airtable.com/v0/appypzFNhpw3sx6YV/tblm2iJo6J4nFsZWD', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat3mxeEAYtwRZGdU.0c273fdd548452c00084c7c3c586c0ad171dd20ed0caa2c8886288e6f9491c95',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          // Try with lowercase field names (common in Airtable)
          name: name,
          email: email,
          use_case: useCase || 'Not specified',
          submission_date: new Date().toISOString()
        }
      })
    });
    
    // Check if Airtable request was successful
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      
      // If we still get an error, let's try a simpler approach with just one field
      // to see if we can successfully create a record
      const fallbackResponse = await fetch('https://api.airtable.com/v0/appypzFNhpw3sx6YV/tblm2iJo6J4nFsZWD', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer pat3mxeEAYtwRZGdU.0c273fdd548452c00084c7c3c586c0ad171dd20ed0caa2c8886288e6f9491c95',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            // Try with the primary field only (usually "Name" or similar)
            "Full Name": name,
            "Email Address": email
          }
        })
      });
      
      if (!fallbackResponse.ok) {
        const fallbackError = await fallbackResponse.json();
        console.error('Fallback attempt error:', fallbackError);
        return res.status(500).json({ 
          error: 'Failed to submit to Airtable', 
          details: errorData,
          fallbackError: fallbackError
        });
      } else {
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback success:', fallbackData);
        return res.status(200).json({ success: true, note: 'Used fallback approach' });
      }
    }
    
    const data = await response.json();
    console.log('Airtable success response:', data);
    
    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in API route:', error.message);
    return res.status(500).json({ error: 'Failed to submit form', message: error.message });
  }
} 