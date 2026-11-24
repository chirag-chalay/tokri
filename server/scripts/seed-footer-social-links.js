import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { readSocialLinks } from '../src/utils/socialLinks.js'

const initialLinks = [
  { platform: 'Instagram', displayText: 'Follow on Instagram', url: 'https://www.instagram.com/tokriii_/', enabled: true, sortOrder: 1 },
  { platform: 'Facebook', displayText: 'Follow on Facebook', url: 'https://www.facebook.com/122129472429476672', enabled: true, sortOrder: 2 },
]

try {
  const seeded = await prisma.$transaction(async (db) => {
    const [setting] = await db.$queryRaw`SELECT socialLinks, JSON_TYPE(socialLinks) AS socialType FROM Setting WHERE id = 1 FOR UPDATE`
    if (!setting) throw new Error('Create the site settings record before initializing social links.')
    if (setting.socialType === 'ARRAY') return false
    const legacy = readSocialLinks(setting.socialLinks)
    const links = initialLinks.map((link) => ({
      ...link,
      url: legacy.find(({ platform }) => platform === link.platform)?.url ?? link.url,
    }))
    links.push(...legacy.filter(({ platform }) => !initialLinks.some((link) => link.platform === platform)))
    await db.setting.update({ where: { id: 1 }, data: { socialLinks: links } })
    return true
  })
  console.log(seeded ? 'Footer social links initialized.' : 'Footer social links already configured.')
} finally {
  await prisma.$disconnect()
}
