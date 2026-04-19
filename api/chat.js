// Vercel Serverless Function - API Route
// This runs server-side, so the API key is hidden from users

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: Log if API key is present
    if (!process.env.GROQ_API_KEY) {
      console.error('ERROR: GROQ_API_KEY environment variable is not set!');
      return res.status(500).json({ 
        error: 'API key not configured',
        choices: [{ message: { content: "Configuration error. Please contact support. 🛠️" } }]
      });
    }
    
    const { messages } = req.body;
    console.log('Received messages:', messages.length);

    const systemMessage = {
      role: "system",
      content: `You are Dysko, a friendly lion learning buddy for kids aged 5-10. Keep responses short (2-3 sentences), fun, and encouraging. Use simple words and emojis like 🦁 ✨ 🎉. Be playful, supportive, and educational. If asked about learning, give helpful tips. If asked general questions, answer appropriately for kids.`
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}` // SECRET - hidden from users!
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [systemMessage, ...messages.slice(-10)],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Groq API success');
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get response',
      choices: [{ message: { content: "Oops! I'm having trouble thinking right now. Try again soon! 🦁" } }]
    });
  }
}
