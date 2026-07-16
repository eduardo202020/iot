import { immersiveTerrainTextures } from "@/components/museiq/model-viewer/constants";
import { ensureFileBackedAsset } from "@/lib/file-backed-asset";
import type { SkyTextureAsset } from "@/lib/sky-assets";
import { Asset } from "expo-asset";
import { useEffect, useState } from "react";

export type ImmersiveEnvironmentAssetsState = "idle" | "loading" | "ready" | "error";

type EnvironmentAssetModule = number | string;

function getEnvironmentAssetModules(skyTextureAsset: SkyTextureAsset) {
  return [
    skyTextureAsset,
    immersiveTerrainTextures.diffuse,
  ] as EnvironmentAssetModule[];
}

export function useImmersiveEnvironmentAssets({
  enabled,
  skyTextureAsset,
}: {
  enabled: boolean;
  skyTextureAsset: SkyTextureAsset;
}) {
  const [state, setState] = useState<ImmersiveEnvironmentAssetsState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setState("idle");
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    setState("loading");
    setError(null);

    Promise.all(
      getEnvironmentAssetModules(skyTextureAsset).map((assetModule) =>
        ensureFileBackedAsset(Asset.fromModule(assetModule)),
      ),
    )
      .then((assets) => {
        const unavailableAsset = assets.find((asset) => !asset.localUri && !asset.uri);
        if (unavailableAsset) {
          throw new Error(`Asset inmersivo sin URI: ${unavailableAsset.name ?? "desconocido"}`);
        }

        if (__DEV__) {
          console.log(
            "[MuseIQ][VR_ENV]",
            JSON.stringify({
              assetCount: assets.length,
              event: "assetsReady",
              localAssetCount: assets.filter((asset) => Boolean(asset.localUri)).length,
            }),
          );
        }

        if (!cancelled) {
          setState("ready");
        }
      })
      .catch((caughtError) => {
        const message =
          caughtError instanceof Error ? caughtError.message : "No se pudieron cargar los assets VR";

        console.warn("[MuseIQ][VR_ENV]", JSON.stringify({ event: "assetsError", message }));
        if (!cancelled) {
          setError(message);
          setState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, skyTextureAsset]);

  return {
    environmentAssetsError: error,
    environmentAssetsReady: state === "ready",
    environmentAssetsState: state,
  };
}
