export type ImmersiveCoordinateSystem = "three-y-up" | "blender-z-up";

export type ImmersiveTourVector = {
  x: number;
  y: number;
  z: number;
};

export type ImmersiveTourPointDefinition = {
  duration: number;
  fov?: number;
  id: string;
  position: ImmersiveTourVector;
  target: ImmersiveTourVector;
};

export type ImmersiveTourDefinition = {
  coordinateSystem: ImmersiveCoordinateSystem;
  description?: string;
  id: string;
  model?: string;
  points: ImmersiveTourPointDefinition[];
};

export const lugarWalkingTour: ImmersiveTourDefinition = {
  id: "lugar-walking-tour",
  model: "models/immersive/lugar.glb",
  coordinateSystem: "blender-z-up",
  description: "Ruta caminable con primer punto panoramico y margen de seguridad sobre el plano.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      position: { x: -19.03416, y: -2.79579, z: 4.06609 },
      target: { x: -13.83723, y: -1.6154, z: 2.76966 },
      fov: 54.06,
    },
    {
      id: "walk-02",
      duration: 5,
      position: { x: -10.29009, y: -1.31193, z: 2.56997 },
      target: { x: -8.55456, y: -2.39402, z: 3.80321 },
      fov: 110.55,
    },
    {
      id: "walk-03",
      duration: 4.6,
      position: { x: -2.8322, y: -3.27819, z: 5.40619 },
      target: { x: -5.26568, y: -2.43701, z: 3.60503 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 4.6,
      position: { x: -5.8089, y: 0.29764, z: 6.23917 },
      target: { x: -8.06572, y: 1.25603, z: 5.16755 },
      fov: 64,
    },
    {
      id: "walk-05",
      duration: 4.6,
      position: { x: -10.42152, y: 4.896, z: 7.95977 },
      target: { x: -10.29328, y: 5.38092, z: 3.45068 },
      fov: 84.36,
    },
    {
      id: "walk-06",
      duration: 4.6,
      position: { x: -16.69439, y: 6.39283, z: 4.85607 },
      target: { x: -20.79059, y: 7.54965, z: 3.69263 },
      fov: 64,
    },
    {
      id: "walk-07",
      duration: 5.4,
      position: { x: -21.18092, y: 5.46911, z: 2.85755 },
      target: { x: -20.34478, y: 6.19823, z: 4.35734 },
      fov: 64,
    },
  ],
};

export const puertaMonumentalIncaWalkingTour: ImmersiveTourDefinition = {
  id: "puerta-monumental-inca-walking-tour",
  model: "models/immersive/puerta_monumental_inca.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      position: { x: 0.27487, y: 1.42055, z: 1.45 },
      target: { x: 2.33874, y: 5.54412, z: 1.34517 },
      fov: 72,
    },
    {
      id: "walk-02",
      duration: 5.2,
      position: { x: 2.64078, y: 7.53767, z: 1.27842 },
      target: { x: 0.65051, y: 9.76506, z: 1.04819 },
      fov: 64,
    },
    {
      id: "walk-03",
      duration: 5.2,
      position: { x: 0.55196, y: 11.47753, z: 1.29111 },
      target: { x: 0.34626, y: 15.16998, z: 0.9298 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      position: { x: 0.1718, y: 17.23328, z: 1.45 },
      target: { x: 0.37289, y: 12.92558, z: 1.35 },
      fov: 64,
    },
  ],
};

export const ushnuWalkingTour: ImmersiveTourDefinition = {
  id: "ushnu-walking-tour",
  model: "models/immersive/ushnu.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      position: { x: 23.94961, y: -19.55284, z: 4.45289 },
      target: { x: 20.80706, y: -19.90931, z: -1.74463 },
      fov: 74.79,
    },
    {
      id: "walk-02",
      duration: 5.2,
      position: { x: 19.69984, y: -19.55174, z: -1.26707 },
      target: { x: 11.72194, y: -19.29378, z: 4.00043 },
      fov: 62.26,
    },
    {
      id: "walk-03",
      duration: 5.2,
      position: { x: 8.26623, y: -18.98738, z: 9.0519 },
      target: { x: 10.44796, y: -18.47086, z: 7.1703 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      position: { x: -0.15163, y: -17.74886, z: 13.06351 },
      target: { x: 9.97818, y: -18.72702, z: 9.03579 },
      fov: 64,
    },
  ],
};

export const ushnu2WalkingTour: ImmersiveTourDefinition = {
  id: "ushnu-2-walking-tour",
  model: "models/immersive/ushnu-2.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      position: { x: 22.81074, y: -19.55761, z: -2.02402 },
      target: { x: 17.43894, y: -19.62534, z: 0.17339 },
      fov: 72,
    },
    {
      id: "walk-02",
      duration: 5.2,
      position: { x: 14.82535, y: -19.57783, z: 2.25721 },
      target: { x: 8.6395, y: -19.07686, z: 8.10425 },
      fov: 64.45,
    },
    {
      id: "walk-03",
      duration: 5.2,
      position: { x: 0.81444, y: -17.95535, z: 11.86904 },
      target: { x: 16.61668, y: -18.33197, z: 4.46088 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      position: { x: -11.56368, y: -17.15866, z: 12.97525 },
      target: { x: 10.36524, y: -18.64228, z: 9.65764 },
      fov: 64,
    },
  ],
};
