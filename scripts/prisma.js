import fs from "fs"
const data = JSON.parse(fs.readFileSync('../data/rarity.json', 'utf8'));
// const metadata = JSON.parse(fs.readFileSync('../data/metadatas.json', 'utf8'));
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
 
const newData = [];
// const card = [];
 
for (const [key, value] of Object.entries(data)) {
    const attribute = {trait_type:key,}
    value.forEach((att)=>{
        newData.push({...attribute,value: att.trait_type,rarity: parseInt(att.rarity, 10)})
    })
  }
 
//   metadata.forEach((
//     card)=>{
//         const newCard = {token_id: card.tonken_id,}
//     })
 
  try {
    const newAttributs = await prisma.attribute.createMany({
        data:newData
    })
  } catch (error) {
    console.log(error)
  }