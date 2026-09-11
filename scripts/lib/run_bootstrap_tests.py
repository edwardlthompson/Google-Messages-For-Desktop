"""Run bootstrap unittests; skip Golden Path modules on child products."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(Path(__file__).resolve().parent) not in sys.path:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_sprint_model import is_template_repo  # noqa: E402

# New 1.1–1.3 tests that assume examples/ or template CI. Child still runs an allowlist.
CHILD_GOLDEN_PATH_MODULES = {
    "test_about_payload_schema",
    "test_android_instrumented_compile",
    "test_android_locale_rtl",
    "test_android_module_fdroid",
    "test_android_nav_property",
    "test_android_r8_gate",
    "test_android_runtime_budget",
    "test_android_sdk_secrets",
    "test_android_signing_runbook",
    "test_android_talkback_keyboard",
    "test_bestpractices_apply",
    "test_build_plan_tally",
    "test_ci_refs",
    "test_cli_module_versions",
    "test_crash_inbox",
    "test_hadolint",
    "test_human_task_leftovers",
    "test_md_yaml_lint",
    "test_playwright_cache",
    "test_psscriptanalyzer",
    "test_required_checks_map",
    "test_reuse_check",
    "test_sanitize_fixture_parity",
    "test_cli_ready_json",
    "test_compose_a11y_lint",
    "test_dependabot_optional_stacks",
    "test_design_chrome_gate",
    "test_emulator_adr_skills",
    "test_espresso_android16",
    "test_fastlane_foss_supply",
    "test_fastlane_metadata",
    "test_fdroid_antifeatures",
    "test_fdroid_build_recipe",
    "test_feature_catalog_lightroom",
    "test_feature_catalog_navigation",
    "test_feedback_clipboard_schema",
    "test_gen_feature_spec",
    "test_human_task_waiting",
    "test_launch_prompt_tokens",
    "test_lighthouse_floors",
    "test_lightroom_lua_lint",
    "test_lightroom_sdk_playbook",
    "test_lightroom_second_entry",
    "test_release_please_hygiene",
    "test_token_contrast",
    "test_web_security_headers",
    "test_openvex",
    "test_pages_demo_health",
    "test_parallel_android_exclusive",
    "test_playwright_trace_retry",
    "test_reproducible_apk_gate",
    "test_required_checks_map",
    "test_rust_go_module_checklist",
    "test_scorecard_sarif",
    "test_settings_bundle_schema",
    "test_setup_github_automerge",
    "test_sprint_smoke",
    "test_sw_cache_budget",
    "test_unifiedpush_sample",
    "test_web_import_hygiene",
    "test_web_module_checklist",
    "test_web_visual_snapshots",
    "test_winget_publish_loop",
}


def main() -> int:
    loader = unittest.TestLoader()
    suite = loader.discover(str(ROOT / "tests"), pattern="test_*.py")
    if not is_template_repo(ROOT):
        kept = unittest.TestSuite()

        def keep(test: unittest.TestCase) -> None:
            ident = getattr(test, "id", lambda: "")()
            name = ident.split(".")[0]
            if name in CHILD_GOLDEN_PATH_MODULES:
                return
            kept.addTest(test)

        def walk(item: unittest.TestSuite | unittest.TestCase) -> None:
            if isinstance(item, unittest.TestSuite):
                for child in item:
                    walk(child)
            else:
                keep(item)

        walk(suite)
        suite = kept
    result = unittest.TextTestRunner(verbosity=1).run(suite)
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
