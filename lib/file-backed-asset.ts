import { Asset } from "expo-asset";

export async function ensureFileBackedAsset(asset: Asset) {
  const currentUri = asset.localUri;

  if (
    currentUri?.startsWith("file://") &&
    !currentUri.startsWith("file:///android_res/")
  ) {
    return asset;
  }

  // Android standalone builds expose bundled images as drawable resources.
  // Expo GL can only decode file:// URIs, so materialize the resource in cache.
  asset.downloaded = false;
  asset.localUri = null;
  const downloadedAsset = await asset.downloadAsync();
  const downloadedUri = downloadedAsset.localUri;

  if (!downloadedUri?.startsWith("file://")) {
    throw new Error(`Asset sin archivo local: ${asset.name}`);
  }

  return asset;
}
