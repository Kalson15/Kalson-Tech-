// api/chat.js
// Place this file in an 'api' folder at the root of your project

export default async function handler(req, res) {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API key not configured. Please contact the administrator.' 
        });
    }

    const { userQuery } = req.body;

    if (!userQuery) {
        return res.status(400).json({ error: 'User query is required' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are Kalson Tech AI, an expert coding assistant. Provide helpful, accurate responses and use Markdown formatting for code blocks.\n\nUser: ${userQuery}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed');
        }

        const data = await response.json();
        
        if (data.candidates && 
            data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts.length > 0) {
            
            return res.status(200).json({ 
                response: data.candidates[0].content.parts[0].text 
            });
        } else {
            return res.status(500).json({ 
                error: "No response generated. Please try again." 
            });
        }
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: `Failed to get response: ${error.message}` 
        });
    }
  }
