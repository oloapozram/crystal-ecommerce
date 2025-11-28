// Quick manual test of AI generator
// Run with: npx tsx scripts/test-ai-generator.ts

import { generateBaziSellingCopy } from '../lib/ai-generators';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('Testing AI Bazi Content Generator...\n');

    // Get first product
    const product = await prisma.product.findFirst();

    if (!product) {
        console.error('No products found in database');
        return;
    }

    console.log(`Generating content for: ${product.baseName} (ID: ${product.id})`);
    console.log(`Element: ${product.baziElement}\n`);

    try {
        const result = await generateBaziSellingCopy(product.id);

        console.log('✅ Generated Successfully!\n');
        console.log('Selling Copy:');
        console.log(result.selling_copy);
        console.log('\nElement Analysis:');
        console.log(result.element_analysis);
        console.log('\nRecommended For:');
        console.log(result.recommended_for);
        console.log('\nConfidence Score:', result.confidence_score);
        console.log('\nSource Facts Used:', result.source_facts_used.length, 'facts');
    } catch (error) {
        console.error('❌ Error:', error);
    }

    await prisma.$disconnect();
}

main();
