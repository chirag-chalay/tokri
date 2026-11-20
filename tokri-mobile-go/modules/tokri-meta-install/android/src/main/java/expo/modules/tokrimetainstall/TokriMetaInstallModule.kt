package expo.modules.tokrimetainstall

import android.app.Application
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsLogger
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TokriMetaInstallModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TokriMetaInstall")

    AsyncFunction("activate") {
      val application = appContext.reactContext?.applicationContext as? Application
      if (application == null || !FacebookSdk.isInitialized() ||
          !FacebookSdk.getAutoLogAppEventsEnabled() || !FacebookSdk.getAdvertiserIDCollectionEnabled()) {
        return@AsyncFunction false
      }
      // Meta's SDK owns install deduplication and Google Play referrer handling.
      AppEventsLogger.activateApp(application)
      true
    }
  }
}
