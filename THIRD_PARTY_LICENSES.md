# Third-Party Licenses

> Generated and maintained per release. Pre-release: run a license summary for root production deps.

## Project License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).

Copyright (c) 2018-2023 Kelvin Nguyen  
Copyright (c) 2026 Edward L. Thompson

## Dependencies

Root `package.json` declares **nativefier** (mac/linux packaging). Windows host packaging uses CLI tools invoked via `npx` / PowerShell (not always declared as root dependencies). There is **no** vendored `examples/**` tree.

```bash
# Root (Yarn lockfile; npm CLI OK)
npx license-checker --production --summary

# Or via project helper when available:
bash scripts/check-license-compliance.sh
```

| Package / component | License | Notes |
|---------------------|---------|-------|
| nativefier | (see lockfile / license-checker) | mac/linux desktop packaging CLI |
| Electron (transitive via Nativefier) | (see nativefier tree) | Runtime of mac/linux builds |
| @yao-pkg/pkg (npx) | MIT | Windows host EXE packaging (`build-host.ps1`) |
| rcedit / subsystem patch | (tool-specific) | GUI subsystem patch on packaged EXE |
| PS-SFTA (`host/windows/src/vendor/SFTA.ps1`) | MIT (DanysysTeam) | UserChoice FTA helper |
| Google Chrome / Microsoft Edge | Proprietary (user-installed) | Required runtime for Windows App Host UI |

## Upstream product

Original project: [`kelyvin/Google-Messages-For-Desktop`](https://github.com/kelyvin/Google-Messages-For-Desktop) (MIT).
