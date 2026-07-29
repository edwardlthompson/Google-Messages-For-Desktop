# Read System.AppUserModel.ID from a top-level window whose title matches -TitleMatch
# and whose process command line contains -CommandLineMatch (our Chromium profile).
param(
  [Parameter(Mandatory = $true)][string]$TitleMatch,
  [Parameter(Mandatory = $true)][string]$CommandLineMatch
)

$ErrorActionPreference = 'Stop'

$cs = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class WindowAumid {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("shell32.dll")] static extern int SHGetPropertyStoreForWindow(IntPtr hwnd, ref Guid riid, out IntPtr ppv);
  [DllImport("propsys.dll", CharSet = CharSet.Unicode)]
  static extern int PropVariantToString(ref PROPVARIANT propvar, [Out] StringBuilder psz, uint cch);
  [DllImport("ole32.dll")] static extern int PropVariantClear(ref PROPVARIANT pvar);

  [StructLayout(LayoutKind.Sequential, Pack = 4)]
  public struct PROPERTYKEY {
    public Guid fmtid;
    public UInt32 pid;
  }

  // Sequential layout matches Windows PROPVARIANT (vt + reserved + union).
  // Explicit FieldOffset layouts mis-read vt/string on some hosts.
  [StructLayout(LayoutKind.Sequential)]
  public struct PROPVARIANT {
    public UInt16 vt;
    public UInt16 wReserved1;
    public UInt16 wReserved2;
    public UInt16 wReserved3;
    public IntPtr p1;
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

  static readonly Guid PKEY_AppUserModel = new Guid("9F4C2855-9F79-4B39-A8D0-E1D42DE1D5F3");
  const uint PID_AppUserModel_ID = 5;
  static readonly Guid IID_IPropertyStore = new Guid("886D8EEB-8CF2-4446-8D02-CDBA1DBDCF99");

  static bool PidMatch(uint pid, uint[] pids) {
    for (int i = 0; i < pids.Length; i++) if (pids[i] == pid) return true;
    return false;
  }

  public static string ReadForPids(uint[] pids, string titleMatch) {
    string found = null;
    EnumWindows((hWnd, l) => {
      if (found != null) return true;
      if (!IsWindowVisible(hWnd)) return true;
      uint pid;
      GetWindowThreadProcessId(hWnd, out pid);
      if (!PidMatch(pid, pids)) return true;
      var sb = new StringBuilder(512);
      GetWindowText(hWnd, sb, sb.Capacity);
      var title = sb.ToString();
      if (string.IsNullOrEmpty(title)) return true;
      if (title.IndexOf(titleMatch, StringComparison.OrdinalIgnoreCase) < 0) return true;

      IntPtr unk;
      var iid = IID_IPropertyStore;
      if (SHGetPropertyStoreForWindow(hWnd, ref iid, out unk) != 0 || unk == IntPtr.Zero) return true;
      try {
        var store = (IPropertyStore)Marshal.GetObjectForIUnknown(unk);
        var key = new PROPERTYKEY { fmtid = PKEY_AppUserModel, pid = PID_AppUserModel_ID };
        PROPVARIANT pv;
        store.GetValue(ref key, out pv);
        try {
          if (pv.vt == 0) return true;
          var buf = new StringBuilder(512);
          if (PropVariantToString(ref pv, buf, 512) == 0) {
            var s = buf.ToString();
            if (!string.IsNullOrWhiteSpace(s)) found = s;
          }
        } finally {
          PropVariantClear(ref pv);
        }
      } finally {
        Marshal.Release(unk);
      }
      return true;
    }, IntPtr.Zero);
    return found;
  }
}
'@

Add-Type -TypeDefinition $cs -Language CSharp -ErrorAction Stop

$pidList = @(
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object {
      ($_.Name -eq 'chrome.exe' -or $_.Name -eq 'msedge.exe') -and
      $_.CommandLine -and ($_.CommandLine.IndexOf($CommandLineMatch) -ge 0)
    } |
    ForEach-Object { [uint32]$_.ProcessId }
)

if ($pidList.Count -eq 0) {
  Write-Output 'AUMID_NONE'
  exit 0
}

$aumid = [WindowAumid]::ReadForPids([uint32[]]$pidList, $TitleMatch)
if ([string]::IsNullOrWhiteSpace($aumid)) {
  Write-Output 'AUMID_NONE'
} else {
  Write-Output ("AUMID_OK " + $aumid)
}
