import AppTrackingTransparency
import ExpoModulesCore
import FBSDKCoreKit

public class TokriMetaInstallModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TokriMetaInstall")

    AsyncFunction("activate") { () -> Bool in
      guard ATTrackingManager.trackingAuthorizationStatus == .authorized,
            Settings.shared.isAutoLogAppEventsEnabled else {
        return false
      }
      AppEvents.shared.activateApp()
      return true
    }.runOnQueue(.main)
  }
}
