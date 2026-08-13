"""Home Assistant provider envelope contract tests."""

import pytest
from custom_components.octopus_media.api.ha_services import _extract_items
from custom_components.octopus_media.exceptions import InvalidResponseError


def test_extract_sonarr_empty_mapping_is_empty() -> None:
    assert _extract_items({"episodes": {}}, "episodes", mapping_values=True) == []


def test_extract_sonarr_empty_list_is_empty() -> None:
    assert _extract_items({"episodes": []}, "episodes", mapping_values=True) == []


def test_extract_sonarr_mapping_values_become_items() -> None:
    payload = {"episodes": {"123": {"id": 123}, "124": {"id": 124}}}
    result = _extract_items(payload, "episodes", mapping_values=True)
    assert {item["id"] for item in result} == {123, 124}


def test_extract_sonarr_scalar_is_invalid() -> None:
    with pytest.raises(InvalidResponseError):
        _extract_items({"episodes": "invalid"}, "episodes", mapping_values=True)


def test_extract_sonarr_missing_key_remains_invalid() -> None:
    with pytest.raises(InvalidResponseError):
        _extract_items({}, "episodes", mapping_values=True)
