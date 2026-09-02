cask "google-messages-for-desktop" do
  version "1.9.0"
  sha256 "REPLACE_WITH_SHA256"

  url "https://github.com/edwardlthompson/Google-Messages-For-Desktop/releases/download/v#{version}/Google.Messages-v#{version}-mac-universal.dmg"
  name "Google Messages For Desktop"
  desc "Google Messages for web as a desktop app"
  homepage "https://github.com/edwardlthompson/Google-Messages-For-Desktop"

  app "Google Messages.app"

  zap trash: [
    "~/Library/Application Support/google-messages-for-desktop",
    "~/Library/Preferences/com.edwardlthompson.google-messages.plist",
  ]
end
