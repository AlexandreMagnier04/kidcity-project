const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getCard(id) {
  try {
    const card = await prisma.card.findFirst({
      where: { id },
      select: {
        name: true,
        attributes: {
          select: {
            trait_type: true,
            value: true,
            rarity: true,
          },
        },
      },
    });

    if (!card) {
      console.log("aucune carte");
    }

    console.log("La carte", JSON.stringify(card, null, 2));
  } catch (error) {
    console.error(error);
  }
}

getCard(200);