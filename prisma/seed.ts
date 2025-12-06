import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Crystal data with Bazi element mappings
const crystalData = [
  { name: 'Amethyst', element: 'WATER', properties: ['intuition', 'spiritual_growth', 'protection', 'clarity'], description: 'Purple quartz for spiritual awareness and protection' },
  { name: 'Clear Quartz', element: 'METAL', properties: ['clarity', 'amplification', 'healing', 'master_healer'], description: 'Master healer crystal, amplifies all energies' },
  { name: 'Rose Quartz', element: 'FIRE', properties: ['love', 'compassion', 'emotional_healing', 'heart_chakra'], description: 'Pink crystal of unconditional love and compassion' },
  { name: 'Citrine', element: 'EARTH', properties: ['abundance', 'manifestation', 'personal_power', 'clarity'], description: 'Golden crystal for abundance and manifestation' },
  { name: 'Black Tourmaline', element: 'WATER', properties: ['protection', 'grounding', 'transmutation', 'shielding'], description: 'Powerful protective stone, grounds negative energy' },
  { name: 'Smoky Quartz', element: 'EARTH', properties: ['grounding', 'protection', 'stress_relief', 'detoxification'], description: 'Grounding brown quartz for releasing negativity' },
  { name: 'Selenite', element: 'METAL', properties: ['clarity', 'purification', 'spiritual_connection', 'cleansing'], description: 'White crystal for spiritual clarity and cleansing' },
  { name: 'Labradorite', element: 'WATER', properties: ['transformation', 'intuition', 'magic', 'protection'], description: 'Iridescent stone of transformation and magic' },
  { name: 'Lapis Lazuli', element: 'WATER', properties: ['wisdom', 'truth', 'communication', 'intuition'], description: 'Deep blue stone of wisdom and truth' },
  { name: 'Tiger Eye', element: 'EARTH', properties: ['courage', 'confidence', 'protection', 'grounding'], description: 'Golden-brown stone for courage and confidence' },
  { name: 'Green Aventurine', element: 'WOOD', properties: ['prosperity', 'luck', 'heart_healing', 'growth'], description: 'Green stone of luck and prosperity' },
  { name: 'Carnelian', element: 'FIRE', properties: ['vitality', 'courage', 'creativity', 'motivation'], description: 'Orange-red stone for vitality and creativity' },
  { name: 'Amazonite', element: 'WATER', properties: ['communication', 'truth', 'harmony', 'soothing'], description: 'Turquoise stone for communication and harmony' },
  { name: 'Moonstone', element: 'WATER', properties: ['intuition', 'feminine_energy', 'lunar_connection', 'emotional_healing'], description: 'Pearly white stone of feminine energy' },
  { name: 'Obsidian', element: 'WATER', properties: ['protection', 'grounding', 'truth', 'shadow_work'], description: 'Black volcanic glass for deep protection' },
  { name: 'Hematite', element: 'METAL', properties: ['grounding', 'protection', 'strength', 'focus'], description: 'Metallic stone for grounding and focus' },
  { name: 'Malachite', element: 'WOOD', properties: ['transformation', 'protection', 'healing', 'growth'], description: 'Green banded stone of transformation' },
  { name: 'Rhodonite', element: 'FIRE', properties: ['healing', 'love', 'compassion', 'emotional_balance'], description: 'Pink stone with black veins for emotional healing' },
  { name: 'Rhodochrosite', element: 'FIRE', properties: ['love', 'self_love', 'compassion', 'emotional_healing'], description: 'Pink banded stone of self-love' },
  { name: 'Fluorite', element: 'WATER', properties: ['clarity', 'focus', 'protection', 'mental_clarity'], description: 'Multi-colored stone for mental clarity' },
  { name: 'Pyrite', element: 'METAL', properties: ['abundance', 'manifestation', 'confidence', 'protection'], description: 'Golden metallic stone of abundance' },
  { name: 'Jade', element: 'WOOD', properties: ['prosperity', 'harmony', 'protection', 'longevity'], description: 'Green stone of prosperity and harmony' },
  { name: 'Blue Lace Agate', element: 'WATER', properties: ['communication', 'peace', 'calm', 'expression'], description: 'Light blue banded stone for peaceful communication' },
  { name: 'Red Jasper', element: 'FIRE', properties: ['vitality', 'strength', 'grounding', 'courage'], description: 'Red stone for vitality and strength' },
  { name: 'Howlite', element: 'METAL', properties: ['calm', 'patience', 'stress_relief', 'awareness'], description: 'White stone for calming and patience' },
  { name: 'Chalcedony', element: 'WATER', properties: ['harmony', 'generosity', 'communication', 'balance'], description: 'Translucent stone for harmony and balance' },
  { name: 'Lepidolite', element: 'WATER', properties: ['calm', 'emotional_balance', 'stress_relief', 'transition'], description: 'Purple stone for emotional balance' },
  { name: 'Shungite', element: 'EARTH', properties: ['protection', 'purification', 'grounding', 'emf_protection'], description: 'Black stone for EMF protection and purification' },
  { name: 'Moldavite', element: 'FIRE', properties: ['transformation', 'spiritual_growth', 'acceleration', 'cosmic_connection'], description: 'Green tektite for rapid transformation' },
  { name: 'Sunstone', element: 'FIRE', properties: ['joy', 'vitality', 'leadership', 'confidence'], description: 'Orange stone of joy and vitality' },
  { name: 'Bloodstone', element: 'EARTH', properties: ['vitality', 'courage', 'grounding', 'purification'], description: 'Dark green stone with red spots for vitality' },
  { name: 'Apatite', element: 'WATER', properties: ['manifestation', 'communication', 'clarity', 'motivation'], description: 'Blue-green stone for manifestation' },
  { name: 'Aquamarine', element: 'WATER', properties: ['communication', 'courage', 'clarity', 'calm'], description: 'Light blue stone for clear communication' },
  { name: 'Kunzite', element: 'FIRE', properties: ['love', 'emotional_healing', 'peace', 'divine_love'], description: 'Pink stone of divine love' },
  { name: 'Chrysocolla', element: 'WATER', properties: ['communication', 'empowerment', 'teaching', 'goddess_energy'], description: 'Blue-green stone for empowered communication' },
  { name: 'Angelite', element: 'WATER', properties: ['peace', 'angelic_connection', 'communication', 'compassion'], description: 'Light blue stone for angelic connection' },
  { name: 'Unakite', element: 'WOOD', properties: ['balance', 'healing', 'grounding', 'emotional_release'], description: 'Green and pink stone for emotional balance' },
  { name: 'Tourmalinated Quartz', element: 'METAL', properties: ['protection', 'grounding', 'balance', 'clarity'], description: 'Clear quartz with black tourmaline inclusions' },
  { name: 'Kyanite', element: 'WATER', properties: ['alignment', 'communication', 'meditation', 'balance'], description: 'Blue blade-like stone for alignment' },
  { name: 'Morganite', element: 'FIRE', properties: ['love', 'compassion', 'divine_love', 'emotional_healing'], description: 'Pink beryl for divine love and compassion' },
  { name: 'Garnet', element: 'FIRE', properties: ['passion', 'drive', 'recognition', 'vitality'], description: 'Deep red stone for passion and drive' },
  { name: 'Yellow Calcite', element: 'EARTH', properties: ['stability', 'focus', 'nurturing', 'clarity'], description: 'Yellow stone for stability and focus' },
  { name: 'Turquoise', element: 'WATER', properties: ['protection', 'healing', 'communication', 'wisdom'], description: 'Blue-green stone for protection and healing' },
];

async function main() {
  console.log('Seeding database with 43 crystal types...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.inventoryStock.deleteMany({});
  await prisma.inventoryPurchase.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  console.log('✓ Existing data cleared');

  // Create suppliers
  const fafa = await prisma.supplier.create({
    data: {
      name: 'fafajewelry',
      contactEmail: 'contact@fafajewelry.com',
      notes: 'Reliable supplier, good quality, ships within 3 days',
    },
  });

  const pandora = await prisma.supplier.create({
    data: {
      name: 'pandora',
      contactEmail: 'wholesale@pandora.com',
      notes: 'Premium quality, higher prices, luxury packaging',
    },
  });

  const crystalDirect = await prisma.supplier.create({
    data: {
      name: 'Crystal Direct Wholesale',
      contactEmail: 'quotes@crystaldirect.com',
      notes: 'Competitive pricing, wide variety',
    },
  });

  console.log('✓ Suppliers created');

  // Create products
  const products = [];
  for (const crystal of crystalData) {
    const product = await prisma.product.create({
      data: {
        baseName: crystal.name,
        sizeMm: 10.00,
        qualityGrade: 'NORMAL' as const,
        sku: `${crystal.name.toUpperCase().replace(/['\s]/g, '-')}-10MM-NORMAL`,
        baziElement: crystal.element as any,
        metaphysicalProperties: crystal.properties,
        description: crystal.description,
        isActive: true,
      },
    });
    products.push(product);
  }

  console.log(`✓ ${products.length} products created`);

  // Create purchases and stock for each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const supplier = i % 3 === 0 ? fafa : i % 3 === 1 ? pandora : crystalDirect;
    const costPerGram = 0.15 + (Math.random() * 0.35); // Random cost between $0.15-$0.50/g
    const weightGrams = 20 + (Math.random() * 30); // Random weight 20-50g
    const quantity = Math.floor(5 + Math.random() * 20); // Random quantity 5-25

    await prisma.inventoryPurchase.create({
      data: {
        productId: product.id,
        supplierId: supplier.id,
        quantityPurchased: quantity,
        weightGrams: weightGrams,
        costTotal: costPerGram * weightGrams,
        markupPercentage: 40.00,
        qualityRating: Math.floor(3 + Math.random() * 3), // 3-5 stars
        purchaseDate: new Date('2025-01-15'),
        notes: `Quality ${product.baseName} from ${supplier.name}`,
      },
    });

    await prisma.inventoryStock.create({
      data: {
        productId: product.id,
        quantityAvailable: quantity,
        weightGramsAvailable: weightGrams,
        avgCostPerGram: costPerGram,
        lastRestockDate: new Date('2025-01-15'),
      },
    });
  }

  console.log('✓ Purchases and stock created');
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
