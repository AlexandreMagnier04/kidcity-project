const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importData() {
  try {
    const metadata = JSON.parse(fs.readFileSync('data/metadatas.json', 'utf8'));
    const rarity = JSON.parse(fs.readFileSync('data/rarity.json', 'utf8'));

    console.log('🔹 Importation des raretés...');

    // D'abord, créer tous les attributs dans la base de données
    for (const category in rarity) {
      console.log(`Traitement de la catégorie : ${category}`);
      
      for (const item of rarity[category]) {
        if (item.trait_type === "Fame") {
          continue;
        }
        await prisma.attribute.create({
          data: {
            trait_type: category,
            value: item.trait_type.toString(), // Conversion en chaîne de caractères
            rarity: parseFloat(item.rarity),
          },
        });
      }
    }

    console.log('✅ Raretés importées avec succès !');

    console.log('🔹 Importation des cartes...');

    for (const card of metadata) {
      // Créer la carte d'abord
      const newUrl = `https://ipfs.io/ipfs/${card.image.split('//')[1]}`;
      const createdCard = await prisma.card.create({
        data: {
          name: card.name,
          imageUrl: newUrl,
        },
      });

      // Puis la connecter à ses attributs
      if (card.attributes && Array.isArray(card.attributes)) {
        for (const attr of card.attributes) {
          // Conversion de la valeur en chaîne de caractères
          const attrValue = attr.value !== undefined ? attr.value.toString() : '';
          const attrTraitType = attr.trait_type || '';

          // Trouver l'attribut correspondant dans la base de données
          try {
            const dbAttribute = await prisma.attribute.findFirst({
              where: {
                trait_type: attrTraitType,
                value: attrValue,
              },
            });

            if (dbAttribute) {
              // Connecter la carte à cet attribut
              await prisma.attribute.update({
                where: { id: dbAttribute.id },
                data: {
                  cards: {
                    connect: { id: createdCard.id },
                  },
                },
              });
            } else {
              // Si l'attribut n'existe pas encore, le créer
              console.log(`Création d'un nouvel attribut: ${attrTraitType} - ${attrValue}`);
              await prisma.attribute.create({
                data: {
                  trait_type: attrTraitType,
                  value: attrValue,
                  rarity: 0, // Valeur par défaut pour la rareté
                  cards: {
                    connect: { id: createdCard.id },
                  },
                },
              });
            }
          } catch (error) {
            console.error(`Erreur avec l'attribut ${attrTraitType} - ${attrValue}:`, error);
          }
        }
      }
    }

    console.log('✅ Cartes importées avec succès !');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation :', error);
    await prisma.$disconnect();
  }
}

// Exécuter l'importation
importData();