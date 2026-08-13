import type { HomeAssistant, HomeAssistantConnection } from "./ha-types";

export const IMAGE_VARIANTS = [
  "poster-small",
  "poster-medium",
  "poster-large",
  "backdrop-small",
  "backdrop-medium",
] as const;
export type ImageVariant = (typeof IMAGE_VARIANTS)[number];

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 360"><rect width="240" height="360" fill="#101820"/><path d="M76 166h88v64H76z" fill="none" stroke="#3dd6c6" stroke-width="6"/><circle cx="120" cy="126" r="32" fill="none" stroke="#3dd6c6" stroke-width="6"/><path d="m92 222 28-28 28 28" fill="none" stroke="#3dd6c6" stroke-width="6"/></svg>',
  );

const SIGNED_PATH_LIFETIME_SECONDS = 300;
const RENEWAL_MARGIN_MS = 30_000;

export function isImageVariant(value: string): value is ImageVariant {
  return IMAGE_VARIANTS.includes(value as ImageVariant);
}

export function isOpaqueImageReference(value: string): boolean {
  return /^image_[A-Za-z0-9_-]{32}$/.test(value);
}

export interface ImageResolutionRequest {
  entryId: string;
  imageRef: string;
  variant: ImageVariant;
}

export interface ImageResolver {
  resolve(request: ImageResolutionRequest): Promise<string>;
  invalidate(request: ImageResolutionRequest): void;
  release(imageRef?: string): void;
}

interface SignedPathResponse {
  path: string;
}

interface CachedSignedPath {
  expiresAt: number;
  path: string;
}

export function imagePath(entryId: string, imageRef: string, variant: ImageVariant): string {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(entryId) || !isOpaqueImageReference(imageRef)) {
    throw new Error("invalid_image_request");
  }
  if (!isImageVariant(variant)) throw new Error("invalid_image_variant");
  return `/api/octopus_media/image/${encodeURIComponent(entryId)}/${imageRef}/${variant}`;
}

export class SignedPathImageResolver implements ImageResolver {
  private readonly cache = new Map<string, CachedSignedPath>();
  private readonly inflight = new Map<string, Promise<string>>();

  constructor(
    private readonly connection: HomeAssistantConnection,
    private readonly now: () => number = Date.now,
  ) {}

  resolve(request: ImageResolutionRequest): Promise<string> {
    const path = imagePath(request.entryId, request.imageRef, request.variant);
    const cached = this.cache.get(path);
    if (cached && cached.expiresAt - RENEWAL_MARGIN_MS > this.now()) {
      return Promise.resolve(cached.path);
    }
    const pending = this.inflight.get(path);
    if (pending) return pending;
    const promise = this.sign(path).finally(() => this.inflight.delete(path));
    this.inflight.set(path, promise);
    return promise;
  }

  invalidate(request: ImageResolutionRequest): void {
    this.cache.delete(imagePath(request.entryId, request.imageRef, request.variant));
  }

  release(): void {
    // Signed paths contain no Blob resources and expire server-side.
  }

  private async sign(path: string): Promise<string> {
    const response = await this.connection.sendMessagePromise<SignedPathResponse>({
      type: "auth/sign_path",
      path,
      expires: SIGNED_PATH_LIFETIME_SECONDS,
    });
    if (
      typeof response.path !== "string" ||
      !response.path.startsWith(`${path}?`) ||
      response.path.includes("://")
    ) {
      throw new Error("invalid_signed_path");
    }
    this.cache.set(path, {
      expiresAt: this.now() + SIGNED_PATH_LIFETIME_SECONDS * 1000,
      path: response.path,
    });
    return response.path;
  }
}

const sharedResolvers = new WeakMap<object, SignedPathImageResolver>();

export function imageResolverFor(hass: HomeAssistant): SignedPathImageResolver {
  const key = hass.connection as object;
  let resolver = sharedResolvers.get(key);
  if (!resolver) {
    resolver = new SignedPathImageResolver(hass.connection);
    sharedResolvers.set(key, resolver);
  }
  return resolver;
}
