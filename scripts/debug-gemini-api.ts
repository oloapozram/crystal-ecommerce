import fetch from 'node-fetch';

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function testConnection() {
    console.log('🔍 Testing Google API Connection...');
    console.log(`🔑 Key starts with: ${API_KEY?.substring(0, 5)}...`);

    try {
        // 1. Try to list models (simplest request)
        console.log('\n1️⃣  Attempting to LIST models...');
        const response = await fetch(URL);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', JSON.stringify(data, null, 2));
            return;
        }

        console.log('✅ Connection Successful! Available models:');
        const models = (data as any).models || [];
        models.forEach((m: any) => console.log(`   - ${m.name}`));

        // 2. Check if our desired model is in the list
        const desiredModel = 'models/gemini-1.5-flash';
        const found = models.find((m: any) => m.name === desiredModel);

        if (found) {
            console.log(`\n✅ ${desiredModel} is available!`);
        } else {
            console.log(`\n⚠️ ${desiredModel} NOT found in the list.`);
        }

    } catch (error) {
        console.error('❌ Network/System Error:', error);
    }
}

testConnection();
