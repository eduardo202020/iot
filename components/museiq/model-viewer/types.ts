import type {
  ImmersiveTourDefinition,
  ImmersiveTourNarration,
} from "@/lib/immersive-tours";
import type { SkyTextureAsset } from "@/lib/sky-assets";
import type { StyleProp, ViewStyle } from "react-native";
import type * as THREE from "three";

export type {
  ImmersiveTourDefinition,
  ImmersiveTourNarration,
  ImmersiveTourVector,
} from "@/lib/immersive-tours";

export type CabezaClavaModelViewProps = {
  autoRotate?: boolean;
  externalRotationY?: number;
  externalZoom?: number;
  headTracking?: boolean;
  headTrackingPaused?: boolean;
  introRotationRadians?: number;
  introRotationSpeed?: number;
  immersiveSubject?: ImmersiveSubject;
  immersiveTour?: ImmersiveTourDefinition;
  interactive?: boolean;
  modelAsset?: ModelAsset;
  modelLabel?: string;
  onHeadTrackingDebug?: (snapshot: HeadTrackingDebugState) => void;
  onModelStatusChange?: (status: "loading" | "ready" | "error") => void;
  onTourSegmentChange?: (segment: ImmersiveTourSegmentState | null) => void;
  recenterSignal?: number;
  showStatus?: boolean;
  skyTextureAsset?: SkyTextureAsset;
  stereo?: boolean;
  style?: StyleProp<ViewStyle>;
  tourPlaybackPaused?: boolean;
  viewMode?: ModelViewMode;
};

export type ModelAsset = number;
export type ImmersiveSubject = "space" | "object";
export type ModelViewMode = "object" | "immersive";

export type GltfJson = {
  accessors: GltfAccessor[];
  bufferViews: GltfBufferView[];
  images?: GltfImage[];
  materials?: GltfMaterial[];
  meshes?: GltfMesh[];
  nodes?: GltfNode[];
  samplers?: GltfSampler[];
  scene?: number;
  scenes?: { nodes?: number[] }[];
  textures?: GltfTexture[];
};

export type GltfAccessor = {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  normalized?: boolean;
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
};

export type GltfBufferView = {
  buffer?: number;
  byteLength: number;
  byteOffset?: number;
  byteStride?: number;
};

export type GltfMesh = {
  primitives: GltfPrimitive[];
};

export type GltfPrimitive = {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
};

export type GltfNode = {
  children?: number[];
  matrix?: number[];
  mesh?: number;
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  translation?: [number, number, number];
};

export type GltfMaterial = {
  emissiveTexture?: { index?: number };
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
    baseColorTexture?: { index?: number };
    metallicFactor?: number;
    roughnessFactor?: number;
  };
};

export type GltfImage = {
  bufferView?: number;
  mimeType?: string;
  uri?: string;
};

export type GltfTexture = {
  sampler?: number;
  source?: number;
};

export type GltfSampler = {
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
};

export type GltfResources = {
  textures: Map<number, THREE.Texture>;
};

export type PreparedModelSource = {
  arrayBuffer: ArrayBuffer;
  binStart: number;
  json: GltfJson;
  resources: GltfResources;
};

export type EmbeddedTextureAsset = {
  height: number;
  localUri: string;
  width: number;
};

export type TextureAsset = number | string;

export type CameraFit = {
  distance: number;
  far: number;
  near: number;
  target: THREE.Vector3;
};

export type ImmersiveCameraRig = {
  basePitch: number;
  baseYaw: number;
  far: number;
  lookDistance: number;
  near: number;
  origin: THREE.Vector3;
  subject: ImmersiveSubject;
  target: THREE.Vector3;
  tourPoints: ImmersiveTourPoint[];
};

export type ImmersiveTourPoint = {
  duration: number;
  fov?: number;
  id: string;
  narration?: ImmersiveTourNarration;
  position: THREE.Vector3;
  target: THREE.Vector3;
};

export type ImmersiveTourFrame = {
  elapsedSeconds: number;
  fov?: number;
  narration?: ImmersiveTourNarration;
  pointId: string;
  pointIndex: number;
  position: THREE.Vector3;
  progress: number;
  segmentDuration: number;
  target: THREE.Vector3;
};

export type ImmersiveTourSegmentState = {
  elapsedSeconds: number;
  narration?: ImmersiveTourNarration;
  pointId: string;
  pointIndex: number;
  progress: number;
  segmentDuration: number;
};

export type HeadTrackingDebugState = {
  alpha: number | null;
  accelerometerAvailable: boolean | null;
  accelerometerEvents: number;
  accelX: number | null;
  accelY: number | null;
  accelZ: number | null;
  beta: number | null;
  deviceMotionAvailable: boolean | null;
  deviceMotionEvents: number;
  error: string | null;
  gyroX: number | null;
  gyroY: number | null;
  gyroZ: number | null;
  gyroscopeAvailable: boolean | null;
  gyroscopeEvents: number;
  headTrackingEnabled: boolean;
  magnetometerAvailable: boolean | null;
  magnetometerEvents: number;
  magX: number | null;
  magY: number | null;
  magZ: number | null;
  pitch: number;
  platform: string;
  source: "none" | "device-motion" | "gyroscope" | "compass";
  yaw: number;
};

export type ModelPreparationProgress = (progress: number) => void;
