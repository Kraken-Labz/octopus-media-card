"""Constants for Octopus Media."""

from typing import Final

DOMAIN: Final = "octopus_media"
NAME: Final = "Octopus Media"
VERSION: Final = "0.0.0"

CONF_SCAFFOLD: Final = "scaffold"
CONF_REF_SECRET: Final = "ref_secret"
CONF_URL: Final = "url"
CONF_API_KEY: Final = "api_key"
CONF_VERIFY_SSL: Final = "verify_ssl"
CONF_TIMEOUT: Final = "timeout"
CONF_JELLYFIN_USER_ID: Final = "jellyfin_user_id"
CONF_JELLYFIN_SERVER_ID: Final = "jellyfin_server_id"
CONF_JELLYFIN_CONFIG_ENTRY_ID: Final = "jellyfin_config_entry_id"
CONF_DEVICE_ALIASES: Final = "device_aliases"
CONF_INSTANCE_NAME: Final = "instance_name"
CONF_PLAYING_INTERVAL: Final = "playing_interval"
CONF_RECENT_INTERVAL: Final = "recent_interval"
CONF_UPCOMING_INTERVAL: Final = "upcoming_interval"
CONF_RECENT_COUNT: Final = "recent_count"
CONF_UPCOMING_COUNT: Final = "upcoming_count"
CONF_FUTURE_DAYS: Final = "future_days"
CONF_GROUP_EPISODES: Final = "group_episodes"
CONF_LANGUAGE: Final = "language"
CONF_DATE_FORMAT: Final = "date_format"
CONF_RADARR_DATE_POLICY: Final = "radarr_date_policy"
CONF_RADARR_CONFIG_ENTRY_ID: Final = "radarr_config_entry_id"
CONF_SONARR_CONFIG_ENTRY_ID: Final = "sonarr_config_entry_id"

DEFAULT_NAME: Final = "Octopus Media"
DEFAULT_VERIFY_SSL: Final = True
DEFAULT_TIMEOUT: Final = 10
DEFAULT_PLAYING_INTERVAL: Final = 10
DEFAULT_RECENT_INTERVAL: Final = 180
DEFAULT_UPCOMING_INTERVAL: Final = 600
DEFAULT_RECENT_COUNT: Final = 50
DEFAULT_UPCOMING_COUNT: Final = 12
DEFAULT_FUTURE_DAYS: Final = 90
DEFAULT_GROUP_EPISODES: Final = True
DEFAULT_LANGUAGE: Final = "auto"
DEFAULT_DATE_FORMAT: Final = "auto"
DEFAULT_RADARR_DATE_POLICY: Final = "digital"

MIN_PLAYING_INTERVAL: Final = 5
MAX_PLAYING_INTERVAL: Final = 60
MIN_RECENT_INTERVAL: Final = 60
MAX_RECENT_INTERVAL: Final = 1800
MIN_TIMEOUT: Final = 2
MAX_TIMEOUT: Final = 60
REFRESH_RATE_LIMIT_SECONDS: Final = 5.0
JELLYFIN_USER_AGENT: Final = f"Octopus-Media-Card/{VERSION} Home-Assistant"

LANGUAGES: Final = ("auto", "pt-BR", "en")
DATE_FORMATS: Final = ("auto", "short", "long")
RADARR_DATE_POLICIES: Final = ("digital", "physical", "cinema", "earliest")

FRONTEND_URL_PATH: Final = "/octopus_media/octopus-media-card.js"
IMAGE_URL: Final = "/api/octopus_media/image/{entry_id}/{image_ref}/{variant}"

WS_GET_ENTRIES: Final = "octopus_media/get_entries"
WS_GET_SNAPSHOT: Final = "octopus_media/get_snapshot"
WS_SUBSCRIBE_SNAPSHOT: Final = "octopus_media/subscribe_snapshot"
WS_GET_DETAILS: Final = "octopus_media/get_details"
WS_REFRESH: Final = "octopus_media/refresh"
