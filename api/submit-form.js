export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get form data from request body
    const { name, email, useCase } = req.body;
    
    // Send data to Airtable
    const response = await fetch('https://api.airtable.com/v0/appypzFNhpw3sx6YV/tblm2iJo6J4nFsZWD', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat3mxeEAYtwRZGdU.0c273fdd548452c00084c7c3c586c0ad171dd20ed0caa2c8886288e6f9491c95',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Name: name,
          Email: email,
          'Use Case': useCase,
          'Submission Date': new Date().toISOString()
        }
      })
    });
    
    // Check if Airtable request was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error submitting to Airtable:', error);
    return res.status(500).json({ error: 'Failed to submit form' });
  }
} 