import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { prisma } from './prisma';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Initialize AI clients (will be null if API key not provided)
const gemini = process.env.GOOGLE_AI_API_KEY
    ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    : null;

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

// Helper function to call AI with fallback
async function callAIWithFallback(prompt: string): Promise<string> {
    const errors: string[] = [];

    // Try Gemini first (free tier is generous)
    if (gemini) {
        try {
            console.log('🤖 Trying Google Gemini...');
            const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log('✅ Gemini succeeded');
            return response.text();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`❌ Gemini failed: ${msg}`);
            errors.push(`Gemini: ${msg}`);
        }
    }

    // Fallback to OpenAI
    if (openai) {
        try {
            console.log('🤖 Trying OpenAI...');
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
            });
            console.log('✅ OpenAI succeeded');
            return completion.choices[0].message.content || '';
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`❌ OpenAI failed: ${msg}`);
            errors.push(`OpenAI: ${msg}`);
        }
    }

    // Final fallback to Anthropic
    if (anthropic) {
        try {
            console.log('🤖 Trying Anthropic Claude...');
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
            });
            const textContent = response.content[0];
            if (textContent.type === 'text') {
                console.log('✅ Anthropic succeeded');
                return textContent.text;
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            console.log(`❌ Anthropic failed: ${msg}`);
            errors.push(`Anthropic: ${msg}`);
        }
    }

    throw new Error(`All AI providers failed. Please add at least one API key to .env.local:\n${errors.join('\n')}`);
}

interface BaziChart {
    birthYear: number;
    animal: string;
    element: string;
    dominantElement: string;
    secondaryElement?: string | null;
    needsBalance: string[];
    strengths: string[];
}

interface BaziSellingCopyResult {
    selling_copy: string;
    element_analysis: string;
    recommended_for: string;
    source_facts_used: string[];
    confidence_score: number;
}

export async function generateBaziSellingCopy(
    productId: number,
    userBaziChart: BaziChart | null = null
): Promise<BaziSellingCopyResult> {
    // 1. Fetch product from database
    const product = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }

    // 2. Load RAG knowledge base
    const crystalsDbPath = path.join(process.cwd(), 'lib', 'bazi-knowledge', 'crystals-database.json');
    const elementsDbPath = path.join(process.cwd(), 'lib', 'bazi-knowledge', 'elements.json');
    const compatibilityDbPath = path.join(process.cwd(), 'lib', 'bazi-knowledge', 'compatibility-rules.json');

    const crystalsDb = JSON.parse(fs.readFileSync(crystalsDbPath, 'utf-8'));
    const elementsDb = JSON.parse(fs.readFileSync(elementsDbPath, 'utf-8'));
    const compatibilityRules = JSON.parse(fs.readFileSync(compatibilityDbPath, 'utf-8'));

    // Find crystal data (try exact match first, then lowercase)
    const crystalKey = Object.keys(crystalsDb).find(
        key => key.toLowerCase() === product.baseName.toLowerCase().replace(/\s+/g, '_')
    );
    const crystalData = crystalKey ? crystalsDb[crystalKey] : null;
    const elementData = product.baziElement ? elementsDb[product.baziElement.toLowerCase()] : null;

    // 3. Construct prompt with RAG context
    const prompt = `You are a certified Bazi consultant and crystal healer. Use ONLY the provided knowledge base. Do NOT invent Bazi properties.

KNOWLEDGE BASE:
${JSON.stringify({ crystalData, elementData, compatibilityRules }, null, 2)}

${userBaziChart ? `CUSTOMER BAZI CHART:
${JSON.stringify(userBaziChart, null, 2)}
` : ''}

PRODUCT DETAILS:
- Name: ${product.baseName}
- Size: ${product.sizeMm}mm
- Quality: ${product.qualityGrade}
- Element: ${product.baziElement}
- Properties: ${JSON.stringify(product.metaphysicalProperties)}

TASK:
Generate a 2-3 paragraph selling description that:
1. Explains the crystal's Bazi element and authentic energetic properties (cite from knowledge base if available)
2. ${userBaziChart ? 'Analyzes compatibility with the customer\'s Bazi chart' : 'Describes general benefits for elemental balance'}
3. Uses warm, spiritual language while being factually accurate (no medical claims)
4. Ends with a gentle call-to-action

CRITICAL RULES:
- If crystal data is available in knowledge base, quote authentic_properties
- Apply element_interactions rules correctly
- If uncertain about a Bazi principle, state "consult a certified Bazi practitioner for personalized analysis"
- NEVER invent new metaphysical properties
- If no specific crystal data exists, use general element properties

Return ONLY valid JSON (no markdown, no code blocks):
{
  "selling_copy": "full paragraph text",
  "element_analysis": "brief explanation of element role",
  "recommended_for": "which Bazi chart types benefit most",
  "source_facts_used": ["array", "of", "knowledge base facts cited"],
  "confidence_score": 0.95
}`;

    // 4. Call AI with fallback
    const responseText = await callAIWithFallback(prompt);

    let result: BaziSellingCopyResult;
    try {
        // Clean up response (remove markdown code blocks if present)
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(cleanedText);
    } catch (error) {
        throw new Error(`Failed to parse AI response: ${responseText}`);
    }

    // 5. Save to database
    const chartHash = userBaziChart
        ? crypto.createHash('sha256').update(JSON.stringify(userBaziChart)).digest('hex')
        : null;

    await prisma.aiGeneratedContent.create({
        data: {
            productId: productId,
            contentType: 'BAZI_SELLING_COPY',
            userBaziChartHash: chartHash,
            generatedContent: result,
            sourceFactsUsed: result.source_facts_used,
            confidenceScore: result.confidence_score,
            humanVerified: false
        }
    });

    return result;
}

export async function generateVideoEditPrompt(
    productId: number,
    platform: 'tiktok' | 'instagram' | 'facebook'
): Promise<any> {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { mediaFiles: true }
    });

    if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
    }

    const platformSpecs = {
        tiktok: { duration: '15-60s', aspect: '9:16', vibe: 'fast, trendy, engaging' },
        instagram: { duration: '15-90s', aspect: '9:16', vibe: 'aesthetic, polished' },
        facebook: { duration: '30-120s', aspect: '1:1 or 16:9', vibe: 'informative, storytelling' }
    };

    const prompt = `You are a professional social media video editor specializing in product content for ${platform}.

PRODUCT:
- Name: ${product.baseName}
- Element: ${product.baziElement}
- Quality: ${product.qualityGrade}
- Metaphysical properties: ${JSON.stringify(product.metaphysicalProperties)}
- Available media: ${product.mediaFiles.length} files

PLATFORM: ${platform}
- Duration: ${platformSpecs[platform].duration}
- Aspect ratio: ${platformSpecs[platform].aspect}
- Vibe: ${platformSpecs[platform].vibe}

CREATE a structured video edit prompt with:
1. Scene-by-scene breakdown (timestamps, shot descriptions, camera angles)
2. Music suggestions (genre, mood, specific tracks if possible)
3. Text overlays (what text, when, style)
4. Hashtags (10-15 relevant hashtags)
5. Caption text (engaging, platform-appropriate)

Return ONLY valid JSON (no markdown):
{
  "video_structure": [
    { "timestamp": "0:00-0:03", "shot_description": "...", "camera_angle": "..." }
  ],
  "music_suggestion": { "vibe": "...", "genre": "...", "specific_tracks": [] },
  "text_overlays": [
    { "timestamp": "0:02", "text": "...", "style": "..." }
  ],
  "hashtags": ["..."],
  "caption": "..."
}`;

    const responseText = await callAIWithFallback(prompt);
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleanedText);

    await prisma.aiGeneratedContent.create({
        data: {
            productId: productId,
            contentType: 'VIDEO_EDIT_PROMPT',
            platform: platform,
            generatedContent: result,
            humanVerified: false
        }
    });

    return result;
}
