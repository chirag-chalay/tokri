Pod::Spec.new do |s|
  s.name           = 'TokriMetaInstall'
  s.version        = '1.0.0'
  s.summary        = 'Consent-gated Meta SDK activation for Tokriii'
  s.description    = s.summary
  s.license        = { :type => 'Private' }
  s.author         = 'Tokriii'
  s.homepage       = 'https://tokriii.com'
  s.platform       = :ios, '16.4'
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'FBSDKCoreKit', '~> 18.0'
  s.source_files = '**/*.swift'
end
