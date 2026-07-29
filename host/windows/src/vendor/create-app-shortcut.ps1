# Create/update a .lnk that launches chrome_proxy.exe / msedge_proxy.exe with an
# AppUserModelID that matches the live Chromium app window (required for non-Chrome pins).
param(
  [Parameter(Mandatory = $true)][string]$ShortcutPath,
  [Parameter(Mandatory = $true)][string]$BrowserPath,
  [Parameter(Mandatory = $true)][string]$Arguments,
  [Parameter(Mandatory = $true)][string]$WorkingDirectory,
  [Parameter(Mandatory = $true)][string]$IconLocation,
  [Parameter(Mandatory = $true)][string]$Description,
  [Parameter(Mandatory = $true)][string]$AppUserModelId,
  [Parameter(Mandatory = $true)][string]$RelaunchCommand,
  [Parameter(Mandatory = $true)][string]$RelaunchDisplayName
)

$ErrorActionPreference = 'Stop'

$cs = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class LnkAumid {
  [StructLayout(LayoutKind.Sequential, Pack = 4)]
  public struct PROPERTYKEY {
    public Guid fmtid;
    public UInt32 pid;
  }

  [StructLayout(LayoutKind.Sequential)]
  public struct PROPVARIANT {
    public UInt16 vt;
    public UInt16 wReserved1;
    public UInt16 wReserved2;
    public UInt16 wReserved3;
    public IntPtr pointerValue;
    public IntPtr p2;
  }

  [ComImport, Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  interface IPropertyStore {
    void GetCount(out uint cProps);
    void GetAt(uint iProp, out PROPERTYKEY pkey);
    void GetValue(ref PROPERTYKEY key, out PROPVARIANT pv);
    void SetValue(ref PROPERTYKEY key, ref PROPVARIANT pv);
    void Commit();
  }

  [DllImport("ole32.dll")]
  static extern int PropVariantClear(ref PROPVARIANT pvar);

  [ComImport, Guid("00021401-0000-0000-C000-000000000046")]
  class CShellLink { }

  [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("000214F9-0000-0000-C000-000000000046")]
  interface IShellLinkW {
    void GetPath([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszFile, int cchMaxPath, IntPtr pfd, uint fFlags);
    void GetIDList(out IntPtr ppidl);
    void SetIDList(IntPtr pidl);
    void GetDescription([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszName, int cchMaxName);
    void SetDescription([MarshalAs(UnmanagedType.LPWStr)] string pszName);
    void GetWorkingDirectory([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszDir, int cchMaxPath);
    void SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string pszDir);
    void GetArguments([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszArgs, int cchMaxPath);
    void SetArguments([MarshalAs(UnmanagedType.LPWStr)] string pszArgs);
    void GetHotkey(out short pwHotkey);
    void SetHotkey(short wHotkey);
    void GetShowCmd(out int piShowCmd);
    void SetShowCmd(int iShowCmd);
    void GetIconLocation([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszIconPath, int cchIconPath, out int piIcon);
    void SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string pszIconPath, int iIcon);
    void SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string pszPathRel, uint dwReserved);
    void Resolve(IntPtr hwnd, uint fFlags);
    void SetPath([MarshalAs(UnmanagedType.LPWStr)] string pszFile);
  }

  [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("0000010b-0000-0000-C000-000000000046")]
  interface IPersistFile {
    void GetClassID(out Guid pClassID);
    [PreserveSig] int IsDirty();
    void Load([MarshalAs(UnmanagedType.LPWStr)] string pszFileName, uint dwMode);
    void Save([MarshalAs(UnmanagedType.LPWStr)] string pszFileName, [MarshalAs(UnmanagedType.Bool)] bool fRemember);
    void SaveCompleted([MarshalAs(UnmanagedType.LPWStr)] string pszFileName);
    void GetCurFile([MarshalAs(UnmanagedType.LPWStr)] out string ppszFileName);
  }

  static readonly Guid PKEY_AppUserModel = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3");

  public static void Create(
    string lnkPath,
    string target,
    string arguments,
    string workingDir,
    string iconLocation,
    string description,
    string aumid,
    string relaunchCmd,
    string relaunchName
  ) {
    var link = (IShellLinkW)new CShellLink();
    link.SetPath(target);
    link.SetArguments(arguments ?? "");
    link.SetWorkingDirectory(workingDir ?? "");
    link.SetDescription(description ?? "");
    if (!string.IsNullOrEmpty(iconLocation)) {
      // "path,0"
      var parts = iconLocation.Split(new[] { ',' }, 2);
      int idx = 0;
      if (parts.Length > 1) int.TryParse(parts[1], out idx);
      link.SetIconLocation(parts[0], idx);
    }

    var store = (IPropertyStore)link;
    SetStr(store, new PROPERTYKEY { fmtid = PKEY_AppUserModel, pid = 5 }, aumid);
    SetStr(store, new PROPERTYKEY { fmtid = PKEY_AppUserModel, pid = 2 }, relaunchCmd);
    SetStr(store, new PROPERTYKEY { fmtid = PKEY_AppUserModel, pid = 4 }, relaunchName);
    store.Commit();

    var file = (IPersistFile)link;
    file.Save(lnkPath, true);
  }

  static void SetStr(IPropertyStore store, PROPERTYKEY key, string value) {
    var pv = new PROPVARIANT();
    pv.vt = 31; // VT_LPWSTR
    pv.pointerValue = Marshal.StringToCoTaskMemUni(value);
    try {
      store.SetValue(ref key, ref pv);
    } finally {
      PropVariantClear(ref pv);
    }
  }
}
'@

Add-Type -TypeDefinition $cs -Language CSharp -ErrorAction Stop
$dir = Split-Path -Parent $ShortcutPath
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
if (Test-Path $ShortcutPath) { Remove-Item -Force $ShortcutPath }

[LnkAumid]::Create(
  $ShortcutPath,
  $BrowserPath,
  $Arguments,
  $WorkingDirectory,
  $IconLocation,
  $Description,
  $AppUserModelId,
  $RelaunchCommand,
  $RelaunchDisplayName
)
Write-Output 'AUMID_OK'
