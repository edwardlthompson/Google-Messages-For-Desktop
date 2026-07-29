; Inno Setup 6+ — Google Messages for Desktop (Windows Chromium App Host)
; Compile via scripts/windows/build-installer.ps1
; Registry ProgIds use GoogleMessages.* (no spaces) so Default Apps lists the app.
; EXE filename is GoogleMessages.exe (no spaces) — required for Win11 SMS picker.
; Capabilities live under Software\Clients\ (same pattern as Chrome/Brave) so
; browser "Suggested apps" lists include Google Messages for tel:/sms:.

#define MyAppName "Google Messages"
#define MyAppExeName "GoogleMessages.exe"
#define MyAppRegName "GoogleMessages"
#define MyAppPublisher "edwardlthompson"
#define MyAppURL "https://github.com/edwardlthompson/Google-Messages-For-Desktop"
#ifndef MyAppVersion
  #define MyAppVersion "1.5.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\..\dist\Windows_Tray_Payload"
#endif
#ifndef OutputDir
  #define OutputDir "..\..\dist"
#endif

[Setup]
AppId={{A7C3E9D2-4F1B-4C8A-9E6D-2B5F8A1C3D4E}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
DefaultDirName={localappdata}\Programs\GoogleMessages
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
; Prefer admin when available so HKLM Default Programs registration can run
OutputDir={#OutputDir}
OutputBaseFilename=GoogleMessagesSetup-{#MyAppVersion}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
RestartApplications=no
InfoAfterFile=install-info.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Registry]
; ProgIds (NO SPACES in key names) — HKCU
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.sms"; ValueType: string; ValueName: ""; ValueData: "URL:SMS Message (Google Messages)"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.sms"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.sms\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.sms\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.tel"; ValueType: string; ValueName: ""; ValueData: "URL:Telephone text (Google Messages)"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.tel"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.tel\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.tel\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.smsto"; ValueType: string; ValueName: ""; ValueData: "URL:SMS Message (Google Messages)"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.smsto\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.callto"; ValueType: string; ValueName: ""; ValueData: "URL:Callto text (Google Messages)"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\{#MyAppRegName}.callto\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

Root: HKCU; Subkey: "Software\Classes\sms"; ValueType: string; ValueName: ""; ValueData: "URL:SMS Message"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\sms"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\sms\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\sms\OpenWithProgids"; ValueType: none; ValueName: "{#MyAppRegName}.sms"; Flags: uninsdeletevalue createvalueifdoesntexist

Root: HKCU; Subkey: "Software\Classes\tel"; ValueType: string; ValueName: ""; ValueData: "URL:Telephone"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\tel"; ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\tel\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\tel\OpenWithProgids"; ValueType: none; ValueName: "{#MyAppRegName}.tel"; Flags: uninsdeletevalue createvalueifdoesntexist

Root: HKCU; Subkey: "Software\Classes\smsto"; ValueType: string; ValueName: ""; ValueData: "URL:SMS Message"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\smsto\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKCU; Subkey: "Software\Classes\callto"; ValueType: string; ValueName: ""; ValueData: "URL:Callto"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\callto\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

Root: HKCU; Subkey: "Software\Classes\Applications\{#MyAppExeName}"; ValueType: string; ValueName: "FriendlyAppName"; ValueData: "{#MyAppName}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\Applications\{#MyAppExeName}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""

; Capabilities under Clients\ (matches Chrome/Brave — required for browser Suggested apps)
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationName"; ValueData: "{#MyAppName}"
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationDescription"; ValueData: "Send SMS/RCS with Google Messages for web (dedicated desktop app)."
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationIcon"; ValueData: "{app}\{#MyAppExeName},0"
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "sms"; ValueData: "{#MyAppRegName}.sms"
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "smsto"; ValueData: "{#MyAppRegName}.smsto"
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "tel"; ValueData: "{#MyAppRegName}.tel"
Root: HKCU; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "callto"; ValueData: "{#MyAppRegName}.callto"
Root: HKCU; Subkey: "Software\RegisteredApplications"; ValueType: string; ValueName: "{#MyAppRegName}"; ValueData: "Software\Clients\{#MyAppRegName}\Capabilities"; Flags: uninsdeletevalue

; HKLM twin (when installer elevated) — browser pickers read this
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}"; ValueType: string; ValueName: ""; ValueData: "{#MyAppName}"; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationName"; ValueData: "{#MyAppName}"
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationDescription"; ValueData: "Send SMS/RCS with Google Messages for web (dedicated desktop app)."
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities"; ValueType: string; ValueName: "ApplicationIcon"; ValueData: "{app}\{#MyAppExeName},0"
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "sms"; ValueData: "{#MyAppRegName}.sms"
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "tel"; ValueData: "{#MyAppRegName}.tel"
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "smsto"; ValueData: "{#MyAppRegName}.smsto"
Root: HKLM; Subkey: "Software\Clients\{#MyAppRegName}\Capabilities\URLAssociations"; ValueType: string; ValueName: "callto"; ValueData: "{#MyAppRegName}.callto"
Root: HKLM; Subkey: "Software\RegisteredApplications"; ValueType: string; ValueName: "{#MyAppRegName}"; ValueData: "Software\Clients\{#MyAppRegName}\Capabilities"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Classes\{#MyAppRegName}.tel\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1""; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\Classes\{#MyAppRegName}.sms\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1""; Flags: uninsdeletekey

; Clean legacy
Root: HKCU; Subkey: "Software\Classes\Google Messages.sms"; Flags: deletekey uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\Google Messages.tel"; Flags: deletekey uninsdeletekey
Root: HKCU; Subkey: "Software\Google Messages"; Flags: deletekey uninsdeletekey
Root: HKCU; Subkey: "Software\GoogleMessages"; Flags: deletekey uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\Applications\Google Messages.exe"; Flags: deletekey uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\Applications\node.exe"; Flags: deletekey
Root: HKCU; Subkey: "Software\RegisteredApplications"; ValueType: string; ValueName: "Google Messages"; Flags: deletevalue

[Run]
Filename: "{app}\{#MyAppExeName}"; Parameters: "--register-protocols"; Flags: runhidden waituntilterminated
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
Filename: "{sys}\cmd.exe"; Parameters: "/c start ms-settings:defaultapps"; Description: "Open Default apps settings (set TEL/SMS to Google Messages)"; Flags: nowait postinstall skipifsilent
