import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load env vars
dotenv.config();

// Use a specific new key for testing
const API_KEY = 'AIzaSyAwU0c1cZ3kBLpoIeEKHjE_RByjAf74oTI';

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
}

console.log('✅ Testing API Key:', API_KEY.substring(0, 10) + '...');

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // TEST 1: Basic Text Check (Flash Latest)
        console.log('🧪 TEST 1: Checking API Key with gemini-flash-latest...');
        const textModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const textResult = await textModel.generateContent("Hello, behave like a doctor");
        const textResponse = await textResult.response;
        console.log('✅ Text Response:', textResponse.text());

        // TEST 2: Vision Check (Flash Latest)
        console.log('\n🧪 TEST 2: Checking Vision with gemini-flash-latest...');
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testGemini();
