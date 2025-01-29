const express = require('express');
const router = express.Router();
const { Groq } = require('groq-sdk');
require('dotenv').config();

// More detailed API key logging
console.log('Environment Check:');
console.log('- GROQ_API_KEY exists:', !!process.env.GROQ_API_KEY);
console.log('- GROQ_API_KEY length:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
console.log('- GROQ_API_KEY prefix:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 6) : 'none');

if (!process.env.GROQ_API_KEY) {
  console.error('ERROR: GROQ_API_KEY is not set in environment variables');
}

// Initialize Groq client with error handling
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  
  // Test the connection
  (async () => {
    try {
      const testCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: 'mixtral-8x7b-32768',
        max_tokens: 10,
      });
      console.log('✅ Groq API connection test successful');
    } catch (error) {
      console.error('❌ Groq API connection test failed:', error.message);
    }
  })();

} catch (error) {
  console.error('Failed to initialize Groq client:', error);
}

router.post('/', async (req, res) => {
  // Set proper content type
  res.setHeader('Content-Type', 'application/json');

  // Log environment state at request time
  console.log('Chat Request Environment Check:', {
    hasGroqKey: !!process.env.GROQ_API_KEY,
    groqKeyLength: process.env.GROQ_API_KEY?.length,
    groqClientInitialized: !!groq,
    nodeEnv: process.env.NODE_ENV
  });

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ API key missing during request handling');
    return res.status(500).json({ 
      error: 'GROQ API key is not configured',
      response: null 
    });
  }

  if (!groq) {
    console.error('GROQ client not initialized during request handling');
    return res.status(500).json({ 
      error: 'AI service is not properly initialized',
      response: null 
    });
  }

  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid message format',
        response: null 
      });
    }

    console.log('Processing chat message:', {
      messageLength: message.length,
      hasGroqClient: !!groq
    });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for an educational mentoring platform called OviEdu. 
          Your role is to assist both mentors and mentees with their questions about education, career development, 
          and mentoring relationships. You should be professional, encouraging, and provide actionable advice. 
          Focus on being clear, concise, and helpful. When appropriate, provide examples or step-by-step guidance.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response format from AI service');
    }

    console.log('API Response received');
    return res.status(200).json({
      error: null,
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('Detailed error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key. Please check your configuration.',
        details: 'The provided GROQ API key is invalid or has expired.',
        response: null
      });
    } else if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        response: null 
      });
    } else if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Unable to connect to AI service. Please try again later.',
        response: null 
      });
    } else {
      return res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        response: null
      });
    }
  }
});

module.exports = router; 