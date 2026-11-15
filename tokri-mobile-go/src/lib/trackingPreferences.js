// A product default is not an explicit customer agreement. Preserve that source.
export async function restoreTrackingPreferences(storage, defaultEnabled, marketingAvailable) {
  const keys = ['tokri_analytics_consent_v1', 'tokri_marketing_consent_v1']
  const values = await Promise.all(keys.map((key) => storage.getItem(key)))
  let defaultApplied = false
  for (let index = 0; index < keys.length; index += 1) {
    if (values[index] == null && defaultEnabled && (index === 0 || marketingAvailable)) {
      values[index] = 'default_allowed'
      await storage.setItem(keys[index], values[index])
      defaultApplied = true
    }
  }
  return { values, defaultApplied }
}
