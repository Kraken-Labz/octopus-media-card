"""Opaque image reference tests."""

import pytest
from custom_components.octopus_media.exceptions import (
    InvalidImageVariantError,
    UnknownImageReferenceError,
)
from custom_components.octopus_media.image_store import (
    ImageCandidate,
    ImageDescriptor,
    ImageKind,
    ImageReferenceStore,
    ImageVariant,
    derive_image_reference,
    is_opaque_image_reference,
)
from custom_components.octopus_media.models import MediaSource


def _descriptor(revision: str = "rev-1") -> ImageDescriptor:
    return ImageDescriptor(
        source=MediaSource.JELLYFIN,
        internal_media_id="fictional-media-id",
        kind=ImageKind.POSTER,
        revision=revision,
        allowed_variants=(ImageVariant.POSTER_SMALL, ImageVariant.POSTER_MEDIUM),
    )


def test_reference_is_deterministic_opaque_and_revisioned() -> None:
    """References reveal no service identifier and change with revision."""
    first = derive_image_reference("fixture-secret", _descriptor())
    assert first == derive_image_reference("fixture-secret", _descriptor())
    assert first != derive_image_reference("fixture-secret", _descriptor("rev-2"))
    assert is_opaque_image_reference(first)
    assert "fictional-media-id" not in first


def test_reference_is_bound_to_server_and_config_entry() -> None:
    original = _descriptor()
    other_server = ImageDescriptor(
        config_entry_id=original.config_entry_id,
        server_id="different_server",
        source=original.source,
        candidates=original.candidates,
        allowed_variants=original.allowed_variants,
    )
    other_entry = ImageDescriptor(
        config_entry_id="different_entry",
        server_id=original.server_id,
        source=original.source,
        candidates=original.candidates,
        allowed_variants=original.allowed_variants,
    )
    assert derive_image_reference("fixture-secret", original) != derive_image_reference(
        "fixture-secret", other_server
    )
    assert derive_image_reference("fixture-secret", original) != derive_image_reference(
        "fixture-secret", other_entry
    )


def test_store_has_closed_reference_and_variant_contract() -> None:
    """Unknown refs and variants fail closed."""
    store = ImageReferenceStore("fixture-secret")
    reference = store.register(_descriptor())
    assert store.resolve(reference, "poster-small") == _descriptor()
    with pytest.raises(InvalidImageVariantError):
        store.resolve(reference, "backdrop")
    with pytest.raises(UnknownImageReferenceError):
        store.resolve("image_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "poster-small")


@pytest.mark.parametrize("unsafe_id", ["https://example.test/a.jpg", "/local/file", "../file"])
def test_descriptor_rejects_url_and_path_inputs(unsafe_id: str) -> None:
    """The registry is not a generic proxy or local file reader."""
    with pytest.raises(ValueError):
        ImageDescriptor(
            source=MediaSource.JELLYFIN,
            internal_media_id=unsafe_id,
            kind=ImageKind.POSTER,
            revision="rev-1",
            allowed_variants=(ImageVariant.POSTER_SMALL,),
        )


@pytest.mark.parametrize(
    ("revision", "image_index"),
    [("", 0), ("revision", 1)],
)
def test_candidate_rejects_invalid_revision_or_index(revision: str, image_index: int) -> None:
    with pytest.raises(ValueError):
        ImageCandidate("valid-id", ImageKind.PRIMARY, revision, image_index=image_index)


def test_descriptor_rejects_mixed_kinds_variants_and_runtime_binding() -> None:
    primary = ImageCandidate("primary-id", ImageKind.PRIMARY, "revision-a")
    backdrop = ImageCandidate("backdrop-id", ImageKind.BACKDROP, "revision-b")
    invalid_arguments = [
        {"candidates": (), "allowed_variants": (ImageVariant.POSTER_SMALL,)},
        {"candidates": (primary,), "allowed_variants": ()},
        {
            "candidates": (primary, backdrop),
            "allowed_variants": (ImageVariant.POSTER_SMALL,),
        },
        {"candidates": (primary,), "allowed_variants": (ImageVariant.BACKDROP_SMALL,)},
    ]
    for arguments in invalid_arguments:
        with pytest.raises(ValueError):
            ImageDescriptor(source=MediaSource.JELLYFIN, **arguments)  # type: ignore[arg-type]

    store = ImageReferenceStore("fixture-secret")
    foreign = ImageDescriptor(
        config_entry_id="other_entry",
        source=MediaSource.JELLYFIN,
        server_id="fixture_server",
        candidates=(primary,),
        allowed_variants=(ImageVariant.POSTER_SMALL,),
    )
    with pytest.raises(ValueError):
        store.register(foreign)


def test_registry_lru_is_bounded() -> None:
    store = ImageReferenceStore("fixture-secret", max_descriptors=1)
    first = store.register(_descriptor("rev-1"))
    second = store.register(_descriptor("rev-2"))
    with pytest.raises(UnknownImageReferenceError):
        store.resolve(first, "poster-small")
    assert store.resolve(second, "poster-small").revision == "rev-2"
    with pytest.raises(ValueError):
        ImageReferenceStore("fixture-secret", max_descriptors=0)
