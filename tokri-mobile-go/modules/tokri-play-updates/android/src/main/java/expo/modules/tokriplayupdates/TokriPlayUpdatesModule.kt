package expo.modules.tokriplayupdates

import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TokriPlayUpdatesModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TokriPlayUpdates")

    AsyncFunction("getAvailableBuild") { promise: Promise ->
      val context = appContext.reactContext?.applicationContext
      if (context == null) {
        promise.resolve(null)
        return@AsyncFunction
      }
      AppUpdateManagerFactory.create(context).appUpdateInfo
        .addOnSuccessListener { info ->
          val version = if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE) {
            info.availableVersionCode()
          } else {
            null
          }
          promise.resolve(version)
        }
        .addOnFailureListener { promise.resolve(null) }
    }
  }
}
