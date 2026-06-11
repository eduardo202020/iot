import terrainDiffuseTexture from "@/assets/textures/terrain/rocky_terrain_02_diff_1k.jpg";
import terrainNormalTexture from "@/assets/textures/terrain/rocky_terrain_02_nor_gl_1k.png";
import terrainRoughnessTexture from "@/assets/textures/terrain/rocky_terrain_02_rough_1k.png";
import type {
  EmbeddedTextureAsset,
  GltfAccessor,
  PreparedModelSource,
  TextureAsset,
} from "@/components/museiq/model-viewer/types";
import type { SkyTextureAsset } from "@/lib/sky-assets";
import * as THREE from "three";

export const COMPONENT_BYTE_SIZE: Record<number, number> = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4,
};

export const ITEM_SIZE: Record<GltfAccessor["type"], number> = {
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
};

export const ATTRIBUTE_MAP: Record<string, string> = {
  COLOR_0: "color",
  NORMAL: "normal",
  POSITION: "position",
  TEXCOORD_0: "uv",
};

export const INTRO_ROTATION_RADIANS = Math.PI * 4;
export const INTRO_ROTATION_SPEED = 0.012;
export const MODEL_WIDTH_FILL_RATIO = 0.98;
export const MAX_MODEL_ZOOM = 3.4;
export const MIN_MODEL_ZOOM = 0.72;
export const MAX_VERTICAL_ROTATION = Math.PI * 0.32;
export const MAX_IMMERSIVE_PITCH = Math.PI * 0.58;
export const IMMERSIVE_TRACKING_PITCH_SENSITIVITY = 2.32;
export const IMMERSIVE_TRACKING_YAW_SENSITIVITY = 1.75;
export const IMMERSIVE_TRACKING_SMOOTHING = 0.5;
export const IMMERSIVE_SENSOR_YAW_DEADZONE = 0.01;
export const IMMERSIVE_SENSOR_PITCH_DEADZONE = 0.0015;
export const IMMERSIVE_SENSOR_YAW_SMOOTHING = 0.24;
export const IMMERSIVE_SENSOR_PITCH_SMOOTHING = 0.56;
export const IMMERSIVE_TOUR_YAW_SMOOTHING = 0.34;
export const IMMERSIVE_TOUR_PITCH_SMOOTHING = 0.64;
export const IMMERSIVE_TILT_YAW_ASSIST = 0.95;
export const IMMERSIVE_COMPASS_YAW_WEIGHT = 1;
export const IMMERSIVE_SPACE_TOUR_HEAD_YAW_WEIGHT = 1.65;
export const IMMERSIVE_SPACE_TOUR_HEAD_PITCH_WEIGHT = 1.92;
export const IMMERSIVE_SPACE_TOUR_HEAD_YAW_DIRECTION = -1;
export const IMMERSIVE_SPACE_TOUR_HEAD_PITCH_DIRECTION = -1;
export const IMMERSIVE_MIN_TOUR_FOV = 35;
export const IMMERSIVE_MAX_TOUR_FOV = 82;
export const ENABLE_3D_TERMINAL_LOGS = false;
export const ENABLE_VR_PERFORMANCE_LOGS = false;
export const VR_PERFORMANCE_LOG_INTERVAL_MS = 1000;
export const VR_EYE_SEPARATION = 0.024;
export const IMMERSIVE_STEREO_TARGET_FRAME_MS = 1000 / 30;
export const IMMERSIVE_TEXTURE_MAX_ANISOTROPY = 2;
export const IMMERSIVE_TERRAIN_EXTRA_RADIUS = 2.4;
export const IMMERSIVE_TERRAIN_MAX_SIZE = 520;
export const IMMERSIVE_TERRAIN_MIN_SIZE = 180;
export const IMMERSIVE_TERRAIN_REPEAT_METERS = 7.5;
export const IMMERSIVE_TERRAIN_Y_LIFT_MIN = 0.04;
export const IMMERSIVE_TERRAIN_Y_LIFT_RATIO = 0.025;

export const deviceOrientationAxis = new THREE.Vector3(0, 0, 1);
export const deviceOrientationEuler = new THREE.Euler();
export const deviceOrientationScreenQuaternion = new THREE.Quaternion();
export const deviceOrientationTransformQuaternion = new THREE.Quaternion(
  -Math.sqrt(0.5),
  0,
  0,
  Math.sqrt(0.5),
);
export const identityQuaternion = new THREE.Quaternion();

export const embeddedTextureFileCache = new Map<string, Promise<EmbeddedTextureAsset>>();
export const preparedModelCache = new Map<number, Promise<PreparedModelSource>>();
export const preparedModelTemplateCache = new Map<number, Promise<THREE.Object3D>>();
export const skyTextureAssetCache = new Map<SkyTextureAsset, Promise<EmbeddedTextureAsset>>();
export const terrainTextureAssetCache = new Map<TextureAsset, Promise<EmbeddedTextureAsset>>();

export const immersiveTerrainTextures = {
  diffuse: terrainDiffuseTexture,
  normal: terrainNormalTexture,
  roughness: terrainRoughnessTexture,
} satisfies Record<string, TextureAsset>;
