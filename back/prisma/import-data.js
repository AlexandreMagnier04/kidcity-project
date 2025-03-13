const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  try {
   
    const metadata = JSON.parse(fs.readFileSync('data/metadatas.json', 'utf8'));
    const rarity = JSON.parse(fs.readFileSync('data/rarity.json', 'utf8'));

    console.log('🔹 Importation des raretés...');

  
    const traitModelMap = {
      'Type': prisma.types,
      'Background': prisma.backgrounds,
      'Expression': prisma.expressions,
      'Hair': prisma.hairs,
      'Hat': prisma.hats,
      'Extra': prisma.extras
    };

    for (const category in rarity) {
      if (!traitModelMap[category]) {
        console.warn(`⚠️ Catégorie inconnue ignorée : ${category}`);
        continue; // Ignore si la catégorie n'existe pas dans la base
      }

      for (const item of rarity[category]) {
        await traitModelMap[category].create({
          data: {
            trait_type: item.trait_type,
            rarity: parseFloat(item.rarity), // Convertir en float
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    console.log('✅ Raretés importées avec succès !');

    console.log('🔹 Importation des cartes...');

    for (const card of metadata) {
      await prisma.card.create({
        data: {
          name: card.id ? card.id.toString() : `Unknown_${Math.random()}`,
          imageUrl: card.image || '',
          background: card.attributes.find((t) => t.trait_type === 'Background')?.value || 'Unknown',
          expression: card.attributes.find((t) => t.trait_type === 'Expression')?.value || 'Unknown',
          hair: card.attributes.find((t) => t.trait_type === 'Hair')?.value || 'Unknown',
          hat: card.attributes.find((t) => t.trait_type === 'Hat')?.value || null,
          extra: card.attributes.find((t) => t.trait_type === 'Extra')?.value || null,
        },
      });
    }

    console.log('✅ Cartes importées avec succès !');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de l’importation :', error);
    await prisma.$disconnect();
  }
}

// Exécuter l'importation
importData();
