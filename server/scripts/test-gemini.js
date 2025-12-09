import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Use a specific new key for testing
const API_KEY = 'AIzaSyB9lVLJhReeLuSZwEG468gd6SBb40KxXGA';

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
}

console.log('✅ Testing API Key:', API_KEY.substring(0, 10) + '...');

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        // TEST 1: Basic Text Check (gemini-1.5-flash)
        console.log('🧪 TEST 1: Checking API Key with gemini-1.5-flash (Text Only)...');
        const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const textResult = await textModel.generateContent("Hello, are you working?");
        const textResponse = await textResult.response;
        console.log('✅ Text Response:', textResponse.text());

        // TEST 2: Vision Check (gemini-1.5-flash)
        console.log('\n🧪 TEST 2: Checking Vision with gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Sample prescription image
        const imageUrl = 'https://res.cloudinary.com/dchrmef0d/image/upload/v1765294406/jeevita/prescriptions/djalnrutjbg3q5tq8pss.jpg';

        console.log('Fetching image:', imageUrl);
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('Image fetched. Size:', buffer.length);
        console.log('Sending to Gemini Vision...');
        const result = await model.generateContent([
            "Describe this image briefly.",
            {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        const response = await result.response;
        console.log('✅ Vision Response:', response.text());

    } catch (error) {
        console.error('❌ Test Failed:', error);
        if (error.response) {
            // console.error('Error Response:', await error.response.json()); 
        }
    }
}

testGemini();
