import './isolation.js'
import { prisma } from '../../src/lib/prisma.js'
import bcrypt from 'bcryptjs'
const fruit = await prisma.category.upsert({ where: { slug: 'review-fruit' }, update: {}, create: { slug: 'review-fruit', label: 'Fruit' } })
const nuts = await prisma.category.upsert({ where: { slug: 'review-nuts' }, update: {}, create: { slug: 'review-nuts', label: 'Nuts' } })
for (const [slug, name, price, taxable] of [
  ['banana', 'Banana', 80, false], ['apple', 'Apple', 199, false],
  ['almond-badam-500g', 'Almond', 500, true], ['cashew-kaju-500g', 'Cashew', 600, true],
  ['pistachio-pista-250g', 'Pistachio', 700, true], ['raisin-kishmish-500g', 'Raisin', 300, true],
]) {
  const data = { name, priceValue: price, isTaxable: taxable, gstRate: taxable ? 5 : 0, categoryId: taxable ? nuts.id : fruit.id, isActive: true }
  const product = await prisma.product.upsert({ where: { slug }, update: data, create: { slug, ...data } })
  await prisma.productTax.upsert({ where: { productId: product.id }, update: { gstRate: data.gstRate }, create: { productId: product.id, productName: name, gstRate: data.gstRate, isTaxable: taxable } })
}
await prisma.setting.upsert({ where: { id: 1 }, update: { razorpayEnabled: false, codEnabled: true, msg91Enabled: false, msg91WhatsappEnabled: false, expressMinimumOrderValue: 1251 }, create: { id: 1, codEnabled: true } })
for (const pincode of ['110001', '400020']) await prisma.serviceablePincode.upsert({ where: { pincode }, update: { isActive: true, morningEnabled: true, expressEnabled: true }, create: { pincode, isActive: true, morningEnabled: true, expressEnabled: true } })
for (const [username, role] of [['review-admin', 'admin'], ['review-staff', 'staff']]) {
  const password = await bcrypt.hash('Isolated-review-password-123', 4)
  await prisma.user.upsert({ where: { username }, update: { role, password, isActive: true }, create: { username, role, password, email: `${username}@example.invalid` } })
}
await prisma.$disconnect()
console.log('Disposable database fixtures seeded; messaging and real payment credentials disabled.')
