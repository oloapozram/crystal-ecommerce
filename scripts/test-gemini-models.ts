import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

async function listModels() {
    try {
        // For some reason the SDK doesn't expose listModels directly on the client instance easily in all versions
        // But we can try to just run a generation with a known model to see if it works, 
        // or try to catch the error which lists available models.
        // Actually, let's just try 'gemini-1.5-flash' again but maybe the issue is the API key itself?
        // The error "models/gemini-pro is not found" usually means the model doesn't exist OR the API key doesn't have access.

        console.log('Testing gemini-pro...');
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Hello');
        console.log('Success with gemini-pro:', await result.response.text());
    } catch (e) {
        console.log('Error with gemini-pro:', (e as Error).message);
    }

    try {
        console.log('Testing gemini-1.5-flash...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello');
        console.log('Success with gemini-1.5-flash:', await result.response.text());
    } catch (e) {
        console.log('Error with gemini-1.5-flash:', (e as Error).message);
    }
}

listModels();
