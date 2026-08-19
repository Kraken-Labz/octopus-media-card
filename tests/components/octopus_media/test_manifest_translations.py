"""Manifest and translation contract tests."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ROOT = Path(__file__).parents[3]
INTEGRATION = ROOT / "custom_components" / "octopus_media"


def _leaf_paths(value: dict[str, Any], prefix: str = "") -> set[str]:
    paths: set[str] = set()
    for key, item in value.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(item, dict):
            paths.update(_leaf_paths(item, path))
        else:
            paths.add(path)
    return paths


def test_manifest_has_public_metadata() -> None:
    """The manifest has public repository metadata and no scaffold placeholders."""
    manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["domain"] == "octopus_media"
    assert manifest["version"] == "0.1.0"
    assert manifest["config_flow"] is True
    assert manifest["requirements"] == []
    documentation = urlparse(manifest["documentation"])
    issue_tracker = urlparse(manifest["issue_tracker"])
    assert documentation.scheme == "https"
    assert documentation.netloc == "github.com"
    assert documentation.path == "/Kraken-Labz/octopus-media-card"
    assert issue_tracker.scheme == "https"
    assert issue_tracker.netloc == "github.com"
    assert issue_tracker.path == "/Kraken-Labz/octopus-media-card/issues"
    assert manifest["codeowners"] == ["@phgsbr"]


def test_translations_are_complete_and_standalone() -> None:
    """Both locales have matching content and no Core build references."""
    english = json.loads((INTEGRATION / "translations" / "en.json").read_text(encoding="utf-8"))
    portuguese = json.loads(
        (INTEGRATION / "translations" / "pt-BR.json").read_text(encoding="utf-8")
    )
    assert _leaf_paths(english) == _leaf_paths(portuguese)
    assert "[%key:" not in json.dumps(english)
    assert "[%key:" not in json.dumps(portuguese)
    assert not (INTEGRATION / "strings.json").exists()


def test_fixture_catalog_has_every_required_scenario() -> None:
    """The backend-visible fixture catalog covers Phase 2 edge cases."""
    fixtures = json.loads((ROOT / "tests" / "fixtures" / "snapshots.json").read_text())
    assert set(fixtures) == {
        "recent_empty",
        "recent_three_movies",
        "recent_grouped_episodes",
        "upcoming_radarr_sonarr",
        "playing_empty",
        "playing_one",
        "playing_multiple",
        "stale",
        "partial_failure",
        "extremely_long_title",
        "missing_image",
    }
