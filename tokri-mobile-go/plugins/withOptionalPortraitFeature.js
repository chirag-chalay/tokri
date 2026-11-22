const { withAndroidManifest } = require('@expo/config-plugins')

const PORTRAIT_FEATURE = 'android.hardware.screen.portrait'

function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest
    const features = (manifest['uses-feature'] ??= [])
    const portrait = features.find((feature) => feature.$?.['android:name'] === PORTRAIT_FEATURE)

    // Keep the activity's orientation preference without filtering out fixed displays in Google Play.
    if (portrait) {
      portrait.$['android:required'] = 'false'
    } else {
      features.push({ $: { 'android:name': PORTRAIT_FEATURE, 'android:required': 'false' } })
    }

    return config
  })
}

module.exports = withOptionalPortraitFeature
