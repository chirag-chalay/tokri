export function openHomeLink(navigation, link) {
  const type = String(link?.type || 'none')
  const value = String(link?.value || '').trim()
  if (type === 'shop') {
    navigation.navigate('Main', { screen: 'Shop' })
    return
  }
  if (type === 'category' && value) {
    navigation.navigate('Categories', { slug: value })
    return
  }
  if (type === 'product' && value) {
    navigation.navigate('Product', { slug: value, origin: 'home_banner' })
  }
}
