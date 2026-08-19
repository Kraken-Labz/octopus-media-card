import { css } from "lit";

export const cardStyles = css`
  :host {
    --octopus-bg: #060a12;
    --octopus-surface: rgb(13 22 35 / 92%);
    --octopus-surface-elevated: #111c2a;
    --octopus-accent: #8b5cf6;
    --octopus-accent-secondary: #39c6c8;
    --octopus-text: #f3f6fb;
    --octopus-muted: #8795a8;
    --octopus-border: rgb(147 171 196 / 17%);
    --octopus-radius-card: 19px;
    --octopus-radius-poster: 12px;
    --octopus-media-accent: var(--octopus-accent);
    --octopus-media-background: var(--octopus-surface);
    --octopus-media-border: var(--octopus-border);
    --octopus-media-title: var(--octopus-text);
    --octopus-media-text: var(--octopus-text);
    --octopus-media-muted: var(--octopus-muted);
    --octopus-strip-background: #06080d;
    --octopus-strip-border: color-mix(in srgb, var(--divider-color, #778198) 38%, transparent);
    --octopus-strip-eyebrow: var(--octopus-accent-secondary);
    --octopus-strip-context-text: rgb(188 223 228 / 72%);
    display: block;
    min-width: 0;
  }
  .card {
    background:
      radial-gradient(circle at 14% -24%, rgb(68 202 204 / 13%), transparent 42%),
      radial-gradient(circle at 92% 112%, rgb(139 92 246 / 13%), transparent 46%),
      linear-gradient(145deg, #0d1724 0%, var(--octopus-bg) 72%);
    border: 1px solid var(--octopus-border);
    border-radius: var(--octopus-radius-card);
    box-shadow:
      0 18px 42px rgb(0 0 0 / 28%),
      inset 0 1px rgb(255 255 255 / 4%);
    box-sizing: border-box;
    color: var(--octopus-text);
    container-type: size;
    display: grid;
    font-family: var(--paper-font-body1_-_font-family, Inter, system-ui, sans-serif);
    gap: 6px;
    grid-template-rows: 22px minmax(0, 1fr);
    min-width: 0;
    overflow: hidden;
    padding: 9px 10px 10px;
    position: relative;
  }
  .card::after {
    background: linear-gradient(
      90deg,
      transparent,
      color-mix(in srgb, var(--octopus-accent) 58%, transparent),
      transparent
    );
    content: "";
    height: 1px;
    left: 12%;
    opacity: 0.5;
    position: absolute;
    right: 56%;
    top: 0;
  }
  .card[data-concept="gallery-clean"] {
    --octopus-surface: #0b1420;
    --octopus-surface-elevated: #121d29;
    --octopus-accent: #6d7f93;
    --octopus-accent-secondary: #48b7b9;
    background: linear-gradient(155deg, #101a27, #080d15 76%);
    box-shadow: 0 14px 34px rgb(0 0 0 / 22%);
  }
  .card[data-appearance="light"] {
    --octopus-bg: #eef4f5;
    --octopus-surface: rgb(255 255 255 / 86%);
    --octopus-surface-elevated: #ffffff;
    --octopus-text: #172832;
    --octopus-muted: #5d7179;
    --octopus-border: rgb(43 104 111 / 18%);
    --octopus-strip-background:
      radial-gradient(circle at 12% -18%, rgb(44 194 196 / 18%), transparent 44%),
      radial-gradient(circle at 88% 118%, rgb(143 92 246 / 12%), transparent 48%),
      linear-gradient(145deg, #faffff, #e4f0f2 74%);
    --octopus-strip-border: rgb(32 104 112 / 18%);
    --octopus-strip-eyebrow: #147b80;
    --octopus-strip-context-text: #46616a;
    background:
      radial-gradient(circle at 14% -24%, rgb(62 190 193 / 18%), transparent 42%),
      radial-gradient(circle at 92% 112%, rgb(139 92 246 / 10%), transparent 46%),
      linear-gradient(145deg, #ffffff 0%, var(--octopus-bg) 72%);
    color: var(--octopus-text);
    box-shadow:
      0 14px 34px rgb(26 73 81 / 14%),
      inset 0 1px rgb(255 255 255 / 80%);
  }
  @media (prefers-color-scheme: light) {
    .card[data-appearance="auto"] {
      --octopus-bg: #eef4f5;
      --octopus-surface: rgb(255 255 255 / 86%);
      --octopus-surface-elevated: #ffffff;
      --octopus-text: #172832;
      --octopus-muted: #5d7179;
      --octopus-border: rgb(43 104 111 / 18%);
      background:
        radial-gradient(circle at 14% -24%, rgb(62 190 193 / 18%), transparent 42%),
        radial-gradient(circle at 92% 112%, rgb(139 92 246 / 10%), transparent 46%),
        linear-gradient(145deg, #ffffff 0%, var(--octopus-bg) 72%);
      color: var(--octopus-text);
      box-shadow:
        0 14px 34px rgb(26 73 81 / 14%),
        inset 0 1px rgb(255 255 255 / 80%);
    }
  }
  .card[data-concept="gallery-clean"]::after {
    opacity: 0.18;
  }
  .card[data-concept="octopus-glass"] {
    --octopus-bg: #070813;
    --octopus-surface: rgb(17 17 34 / 76%);
    --octopus-surface-elevated: rgb(24 28 48 / 90%);
    --octopus-accent: #9b6cff;
    --octopus-accent-secondary: #3ed5d0;
    backdrop-filter: blur(18px) saturate(118%);
    background:
      radial-gradient(circle at 12% -18%, rgb(62 213 208 / 16%), transparent 45%),
      radial-gradient(circle at 88% 116%, rgb(155 108 255 / 20%), transparent 48%),
      linear-gradient(145deg, rgb(19 23 43 / 91%), rgb(6 8 18 / 95%));
    box-shadow:
      0 18px 44px rgb(0 0 0 / 31%),
      inset 0 1px rgb(255 255 255 / 6%);
  }
  .card[data-concept="cinematic-octopus-gallery"] {
    --octopus-bg: #060710;
    --octopus-surface: rgb(15 16 33 / 78%);
    --octopus-surface-elevated: rgb(22 25 43 / 88%);
    --octopus-accent: #9c6dff;
    --octopus-accent-secondary: #3bd4d0;
    backdrop-filter: blur(18px) saturate(116%);
    background:
      radial-gradient(circle at 12% -14%, rgb(50 220 213 / 24%), transparent 44%),
      radial-gradient(circle at 88% 108%, rgb(158 91 255 / 34%), transparent 52%),
      linear-gradient(145deg, rgb(11 28 42 / 95%), rgb(13 8 30 / 97%));
    gap: 3px;
    grid-template-rows: 18px minmax(0, 1fr);
    isolation: isolate;
    padding: 6px 8px;
  }
  .card[data-concept="cinematic-octopus-gallery"]::after {
    opacity: 0.34;
    z-index: 4;
  }
  .card[data-concept="cinematic-octopus-gallery"] header,
  .card[data-concept="cinematic-octopus-gallery"] .content {
    position: relative;
    z-index: 3;
  }
  .card[data-concept="cinematic-octopus-gallery"] h2 {
    font-size: 12.5px;
  }
  .card[data-concept="cinematic-octopus-gallery"] .context {
    font-size: 8.5px;
    height: 16px;
    min-width: 16px;
  }
  .card[data-playing-hero="true"] {
    background: transparent;
    border: 0;
    box-shadow: none;
    gap: 0;
    grid-template-rows: minmax(0, 1fr);
    border-radius: 0;
    overflow: visible;
    padding: 0;
  }
  .card[data-playing-hero="true"]:not(.fixed) {
    min-height: 210px;
  }
  .card[data-playing-hero="true"]::after {
    display: none;
  }
  .card[data-playing-hero="true"] .content {
    height: 100%;
  }
  .ambient-background {
    filter: blur(28px) brightness(0.48) saturate(0.58) contrast(1.12);
    inset: -34px;
    opacity: 0.92;
    pointer-events: none;
    position: absolute;
    transform: scale(1.16);
    z-index: -4;
  }
  .ambient-preload {
    height: 1px;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: absolute;
    width: 1px;
    z-index: -1;
  }
  .ambient-color,
  .ambient-vignette {
    inset: 0;
    pointer-events: none;
    position: absolute;
    z-index: -3;
  }
  .ambient-color {
    background:
      radial-gradient(circle at 15% 49%, rgb(6 121 137 / 42%), transparent 39%),
      radial-gradient(circle at 56% 18%, rgb(97 131 162 / 14%), transparent 28%),
      radial-gradient(circle at 88% 45%, rgb(111 52 166 / 48%), transparent 46%),
      linear-gradient(100deg, rgb(2 37 46 / 66%), rgb(20 13 36 / 42%) 54%, rgb(58 21 82 / 64%));
  }
  .card[data-layout="strip"][data-has-ambient="false"] .ambient-color {
    background:
      radial-gradient(circle at 13% 35%, rgb(24 174 191 / 34%), transparent 34%),
      radial-gradient(circle at 72% 24%, rgb(139 82 214 / 32%), transparent 37%),
      radial-gradient(circle at 91% 82%, rgb(67 32 116 / 48%), transparent 42%),
      linear-gradient(105deg, #032d36, #121329 48%, #321447);
  }
  .ambient-vignette {
    box-shadow: inset 0 0 78px 21px rgb(0 0 0 / 58%);
    z-index: -1;
  }
  .card[data-layout="strip"] {
    background: var(--octopus-strip-background);
    border-color: var(--octopus-strip-border);
    border-radius: 14px;
    box-shadow: none;
    gap: 0;
    grid-template-rows: 22px minmax(0, 1fr);
    isolation: isolate;
    padding: 0 9px;
  }
  .card[data-layout="strip"]:not(.fixed) {
    min-height: 210px;
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-background {
    display: none;
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-color {
    background:
      radial-gradient(circle at 13% 35%, rgb(32 188 193 / 12%), transparent 38%),
      radial-gradient(circle at 82% 18%, rgb(143 92 246 / 10%), transparent 42%),
      linear-gradient(
        105deg,
        rgb(251 255 255 / 48%),
        rgb(232 243 245 / 24%) 52%,
        rgb(244 237 251 / 34%)
      );
  }
  .card[data-layout="strip"][data-appearance="light"] .ambient-vignette {
    box-shadow: inset 0 0 42px 8px rgb(37 101 108 / 7%);
  }
  .card[data-layout="strip"][data-wide="true"] {
    padding-inline: 35px;
  }
  .card[data-layout="strip"]::after {
    display: none;
  }
  .card[data-layout="strip"] header,
  .card[data-layout="strip"] .content {
    min-width: 0;
    position: relative;
    z-index: 1;
  }
  .card[data-layout="strip"] header {
    gap: 6px;
    padding: 2px 2px 0;
  }
  .card[data-layout="strip"] .heading {
    align-items: center;
    display: flex;
    gap: 0;
    min-width: 0;
    padding: 2px 2px 0;
  }
  .card[data-layout="strip"] ha-icon {
    color: var(--octopus-media-accent, #aa75f2);
    height: 14px;
    width: 14px;
  }
  .card[data-layout="strip"] h2 {
    color: var(--octopus-strip-eyebrow);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.13em;
    line-height: 1.1;
    text-transform: uppercase;
  }
  .card[data-layout="strip"] .context {
    background: transparent;
    border: 0;
    border-radius: 0;
    color: var(--octopus-strip-context-text);
    font-size: 9px;
    font-variant-numeric: tabular-nums;
    height: auto;
    min-width: 0;
    padding: 0 2px;
  }
  .card[data-layout="strip"] .content {
    gap: 0;
  }
  .card[data-header-alignment="center"] header {
    justify-content: center;
  }
  .card[data-header-alignment="center"] .context {
    position: absolute;
    right: 2px;
  }
  .card[data-header-alignment="end"] header {
    flex-direction: row-reverse;
  }
  .card.fixed {
    height: var(--octopus-card-height);
  }
  header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    min-height: 20px;
    min-width: 0;
  }
  .heading {
    align-items: center;
    display: flex;
    gap: 7px;
    min-width: 0;
  }
  ha-icon {
    color: var(--octopus-accent);
    height: 15px;
    width: 15px;
  }
  h2 {
    color: var(--octopus-text);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.1;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .context {
    align-items: center;
    background: color-mix(in srgb, var(--octopus-surface-elevated) 78%, transparent);
    border: 1px solid var(--octopus-border);
    border-radius: 999px;
    color: var(--octopus-muted);
    display: inline-flex;
    font-size: 9px;
    height: 18px;
    justify-content: center;
    min-width: 18px;
    padding-inline: 4px;
  }
  .content {
    display: grid;
    gap: 3px;
    grid-template-rows: minmax(0, 1fr) auto auto;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .layout {
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(min(138px, 100%), 1fr));
    overflow: auto;
    scrollbar-width: none;
  }
  .grid::-webkit-scrollbar,
  .list::-webkit-scrollbar,
  .portrait::-webkit-scrollbar {
    display: none;
  }
  .hero {
    align-items: center;
    border-radius: calc(var(--octopus-radius-card) - 7px);
    box-sizing: border-box;
    display: grid;
    gap: 14px;
    grid-template-columns: minmax(70px, min(29%, 126px)) minmax(0, 1fr);
    isolation: isolate;
    overflow: hidden;
    padding: 7px 12px 7px 8px;
    position: relative;
  }
  .hero::after {
    background: linear-gradient(
      90deg,
      rgb(5 8 15 / 82%) 0%,
      rgb(5 8 15 / 48%) 48%,
      rgb(5 8 15 / 74%) 100%
    );
    content: "";
    inset: 0;
    position: absolute;
    z-index: -1;
  }
  .hero .hero-backdrop {
    filter: blur(2px) saturate(0.85) brightness(0.52);
    inset: -8px;
    opacity: 0.74;
    position: absolute;
    transform: scale(1.04);
    z-index: -2;
  }
  .hero octopus-media-poster {
    height: 100%;
    min-height: 0;
    position: relative;
  }
  .hero-copy {
    --octopus-metadata-title-line-height: 1.1;
    --octopus-metadata-title-size: clamp(17px, 4.2cqi, 25px);
    display: grid;
    gap: 9px;
    max-height: 100%;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }
  .compact {
    display: grid;
    gap: 7px;
    grid-template-columns: minmax(0, 1.45fr) repeat(2, minmax(0, 1fr));
  }
  .compact-item {
    border-radius: var(--octopus-radius-poster);
    min-width: 0;
    overflow: hidden;
    position: relative;
  }
  .compact-item octopus-media-image {
    height: 100%;
    width: 100%;
  }
  .compact-item::after {
    background: linear-gradient(180deg, transparent 34%, rgb(3 7 14 / 92%));
    content: "";
    inset: 0;
    pointer-events: none;
    position: absolute;
  }
  .compact-overlay {
    bottom: 0;
    display: grid;
    gap: 2px;
    left: 0;
    padding: 7px;
    position: absolute;
    right: 0;
    z-index: 1;
  }
  .compact-overlay strong {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    display: -webkit-box;
    font-size: 10px;
    line-height: 1.12;
    overflow: hidden;
  }
  .compact-overlay span {
    color: var(--octopus-muted);
    font-size: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list {
    display: grid;
    gap: 6px;
    overflow: auto;
    scrollbar-width: none;
  }
  .list-row {
    align-items: center;
    background: color-mix(in srgb, var(--octopus-surface-elevated) 44%, transparent);
    border-radius: 10px;
    display: grid;
    gap: 9px;
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-width: 0;
    padding: 5px;
  }
  .portrait {
    display: grid;
    gap: 11px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: auto;
    scrollbar-width: none;
  }
  .stale,
  .partial {
    color: #f4c96d;
    font-size: 9px;
    margin: 0;
  }
  .partial {
    color: #d7b6ff;
  }
  .upcoming-empty {
    align-items: center;
    color: var(--octopus-muted);
    display: flex;
    font-size: 11px;
    gap: 7px;
    justify-content: center;
    min-height: 88px;
  }
  .upcoming-empty ha-icon {
    color: var(--octopus-accent-secondary);
    height: 18px;
    width: 18px;
  }
  @media (max-width: 430px) {
    .card {
      padding-inline: 8px;
    }
    .hero {
      gap: 10px;
      grid-template-columns: minmax(68px, 30%) minmax(0, 1fr);
      padding-inline: 6px 9px;
    }
    .compact {
      gap: 5px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
