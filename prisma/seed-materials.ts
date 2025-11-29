import { PrismaClient, BaziElement } from '@prisma/client'

const prisma = new PrismaClient()

const CRYSTAL_MATERIALS = [
    // FIRE Element (8)
    {
        name: 'Carnelian',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Creativity', 'Courage', 'Vitality', 'Motivation'],
        chakra: 'Sacral',
        color: 'Orange-Red',
        description: 'A stone of creativity, courage, and vitality'
    },
    {
        name: 'Sunstone',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Joy', 'Leadership', 'Abundance', 'Optimism'],
        chakra: 'Solar Plexus',
        color: 'Orange-Gold',
        description: 'Brings joy, leadership energy, and abundance'
    },
    {
        name: 'Red Jasper',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Strength', 'Stamina', 'Grounding', 'Endurance'],
        chakra: 'Root',
        color: 'Red-Brown',
        description: 'Stone of strength, stamina, and grounding energy'
    },
    {
        name: 'Fire Agate',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Protection', 'Energy', 'Passion', 'Courage'],
        chakra: 'Root',
        color: 'Red-Orange',
        description: 'Protective stone with fiery energy and passion'
    },
    {
        name: 'Ruby',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Love', 'Prosperity', 'Confidence', 'Vitality'],
        chakra: 'Heart',
        color: 'Deep Red',
        description: 'Stone of love, prosperity, and vital energy'
    },
    {
        name: 'Garnet',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Regeneration', 'Passion', 'Balance', 'Energy'],
        chakra: 'Root',
        color: 'Deep Red',
        description: 'Regenerative stone of passion and balance'
    },
    {
        name: 'Citrine',
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Manifestation', 'Success', 'Positivity', 'Abundance'],
        chakra: 'Solar Plexus',
        color: 'Yellow-Gold',
        description: 'Stone of manifestation, success, and abundance'
    },
    {
        name: "Tiger's Eye",
        baziElement: 'FIRE' as BaziElement,
        defaultProperties: ['Confidence', 'Willpower', 'Focus', 'Protection'],
        chakra: 'Solar Plexus',
        color: 'Golden Brown',
        description: 'Stone of confidence, willpower, and focus'
    },

    // EARTH Element (8)
    {
        name: 'Smoky Quartz',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Grounding', 'Protection', 'Detoxification', 'Stability'],
        chakra: 'Root',
        color: 'Brown-Gray',
        description: 'Grounding and protective stone'
    },
    {
        name: 'Brown Jasper',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Stability', 'Comfort', 'Nurturing', 'Connection'],
        chakra: 'Root',
        color: 'Brown',
        description: 'Stone of stability and nurturing energy'
    },
    {
        name: 'Petrified Wood',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Patience', 'Transformation', 'Grounding', 'Ancient Wisdom'],
        chakra: 'Root',
        color: 'Brown-Tan',
        description: 'Stone of patience and ancient wisdom'
    },
    {
        name: 'Aragonite',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Centering', 'Patience', 'Reliability', 'Grounding'],
        chakra: 'Root',
        color: 'Brown-White',
        description: 'Centering stone of patience and reliability'
    },
    {
        name: 'Moss Agate',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Growth', 'Abundance', 'Nature Connection', 'Stability'],
        chakra: 'Heart',
        color: 'Green-White',
        description: 'Stone of growth and connection to nature'
    },
    {
        name: 'Unakite',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Balance', 'Rebirth', 'Emotional Healing', 'Grounding'],
        chakra: 'Heart',
        color: 'Green-Pink',
        description: 'Stone of balance and emotional healing'
    },
    {
        name: 'Green Jade',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Harmony', 'Prosperity', 'Longevity', 'Wisdom'],
        chakra: 'Heart',
        color: 'Green',
        description: 'Stone of harmony, prosperity, and longevity'
    },
    {
        name: 'Malachite',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Transformation', 'Protection', 'Healing', 'Growth'],
        chakra: 'Heart',
        color: 'Green',
        description: 'Transformative stone of protection and healing'
    },
    {
        name: 'Rose Quartz',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Love', 'Compassion', 'Healing', 'Self-Love'],
        chakra: 'Heart',
        color: 'Pink',
        description: 'Stone of unconditional love and compassion'
    },
    {
        name: 'Black Tourmaline',
        baziElement: 'EARTH' as BaziElement,
        defaultProperties: ['Protection', 'Grounding', 'Purification', 'Shielding'],
        chakra: 'Root',
        color: 'Black',
        description: 'Powerful protective and grounding stone'
    },

    // METAL Element (8)
    {
        name: 'Clear Quartz',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Amplification', 'Clarity', 'Energy', 'Healing'],
        chakra: 'Crown',
        color: 'Clear',
        description: 'Master healer and energy amplifier'
    },
    {
        name: 'Selenite',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Cleansing', 'Clarity', 'Higher Consciousness', 'Peace'],
        chakra: 'Crown',
        color: 'White',
        description: 'Stone of cleansing and higher consciousness'
    },
    {
        name: 'Apophyllite',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Spiritual Connection', 'Truth', 'Clarity', 'Meditation'],
        chakra: 'Third Eye',
        color: 'Clear-White',
        description: 'Stone of spiritual connection and truth'
    },
    {
        name: 'Herkimer Diamond',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Attunement', 'Clarity', 'Dreams', 'Amplification'],
        chakra: 'Crown',
        color: 'Clear',
        description: 'High-vibration stone of attunement and clarity'
    },
    {
        name: 'Pyrite',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Abundance', 'Willpower', 'Manifestation', 'Protection'],
        chakra: 'Solar Plexus',
        color: 'Gold',
        description: 'Stone of abundance and manifestation'
    },
    {
        name: 'Hematite',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Grounding', 'Protection', 'Focus', 'Strength'],
        chakra: 'Root',
        color: 'Silver-Black',
        description: 'Grounding and protective stone'
    },
    {
        name: 'Labradorite',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Magic', 'Protection', 'Transformation', 'Intuition'],
        chakra: 'Third Eye',
        color: 'Gray-Blue',
        description: 'Stone of magic and transformation'
    },
    {
        name: 'Moonstone',
        baziElement: 'METAL' as BaziElement,
        defaultProperties: ['Intuition', 'Feminine Energy', 'New Beginnings', 'Emotional Balance'],
        chakra: 'Crown',
        color: 'White-Peach',
        description: 'Stone of intuition and new beginnings'
    },

    // WATER Element (8)
    {
        name: 'Aquamarine',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Calm', 'Communication', 'Courage', 'Clarity'],
        chakra: 'Throat',
        color: 'Blue-Green',
        description: 'Stone of calm communication and courage'
    },
    {
        name: 'Blue Lace Agate',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Peace', 'Communication', 'Serenity', 'Calm'],
        chakra: 'Throat',
        color: 'Light Blue',
        description: 'Stone of peaceful communication'
    },
    {
        name: 'Larimar',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Tranquility', 'Clarity', 'Healing', 'Serenity'],
        chakra: 'Throat',
        color: 'Blue-White',
        description: 'Stone of tranquility and clarity'
    },
    {
        name: 'Sodalite',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Logic', 'Truth', 'Intuition', 'Communication'],
        chakra: 'Third Eye',
        color: 'Blue',
        description: 'Stone of logic and intuitive truth'
    },
    {
        name: 'Lapis Lazuli',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Wisdom', 'Truth', 'Inner Vision', 'Communication'],
        chakra: 'Third Eye',
        color: 'Deep Blue',
        description: 'Stone of wisdom and inner vision'
    },
    {
        name: 'Azurite',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Insight', 'Intuition', 'Spiritual Awareness', 'Clarity'],
        chakra: 'Third Eye',
        color: 'Deep Blue',
        description: 'Stone of insight and spiritual awareness'
    },
    {
        name: 'Amethyst',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Calm', 'Spiritual Protection', 'Intuition', 'Clarity'],
        chakra: 'Third Eye',
        color: 'Purple',
        description: 'Stone of calm and spiritual protection'
    },
    {
        name: 'Celestite',
        baziElement: 'WATER' as BaziElement,
        defaultProperties: ['Peace', 'Angelic Connection', 'Calm', 'Clarity'],
        chakra: 'Crown',
        color: 'Light Blue',
        description: 'Stone of peace and angelic connection'
    },

    // WOOD Element (8)
    {
        name: 'Green Aventurine',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Luck', 'Growth', 'Opportunity', 'Prosperity'],
        chakra: 'Heart',
        color: 'Green',
        description: 'Stone of luck and opportunity'
    },
    {
        name: 'Amazonite',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Truth', 'Communication', 'Harmony', 'Balance'],
        chakra: 'Throat',
        color: 'Blue-Green',
        description: 'Stone of truth and harmony'
    },
    {
        name: 'Chrysoprase',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Growth', 'Compassion', 'Acceptance', 'Healing'],
        chakra: 'Heart',
        color: 'Apple Green',
        description: 'Stone of growth and compassion'
    },
    {
        name: 'Emerald',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Love', 'Abundance', 'Growth', 'Wisdom'],
        chakra: 'Heart',
        color: 'Green',
        description: 'Stone of love and abundance'
    },
    {
        name: 'Peridot',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Renewal', 'Growth', 'Prosperity', 'Healing'],
        chakra: 'Heart',
        color: 'Olive Green',
        description: 'Stone of renewal and prosperity'
    },
    {
        name: 'Prehnite',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Peace', 'Protection', 'Unconditional Love', 'Healing'],
        chakra: 'Heart',
        color: 'Pale Green',
        description: 'Stone of peace and unconditional love'
    },
    {
        name: 'Tree Agate',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Growth', 'Stability', 'Connection to Nature', 'Abundance'],
        chakra: 'Heart',
        color: 'Green-White',
        description: 'Stone of growth and connection to nature'
    },
    {
        name: 'Fuchsite',
        baziElement: 'WOOD' as BaziElement,
        defaultProperties: ['Resilience', 'Self-Worth', 'Emotional Healing', 'Growth'],
        chakra: 'Heart',
        color: 'Green',
        description: 'Stone of resilience and self-worth'
    },
]

async function seedMaterials() {
    console.log('🌱 Seeding crystal materials...')

    for (const material of CRYSTAL_MATERIALS) {
        await prisma.crystalMaterial.upsert({
            where: { name: material.name },
            update: material,
            create: material,
        })
        console.log(`✅ ${material.name} (${material.baziElement})`)
    }

    console.log(`\n✨ Successfully seeded ${CRYSTAL_MATERIALS.length} crystal materials!`)
}

seedMaterials()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
