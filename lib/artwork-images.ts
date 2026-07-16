// Importar todas las imágenes explícitamente para que el bundler las incluya
import Mvp01 from "@/assets/images/artworks/mvp-selected/01-musico-moche.png";
import Mvp02 from "@/assets/images/artworks/mvp-selected/02-botella-chimu-lambayeque.png";
import Mvp03 from "@/assets/images/artworks/mvp-selected/03-aribalo-inca.png";
import Mvp04 from "@/assets/images/artworks/mvp-selected/04-asiento-del-inca.png";
import Mvp05 from "@/assets/images/artworks/mvp-selected/05-botella-chavin-204002.png";
import Mvp06 from "@/assets/images/artworks/mvp-selected/06-obelisco-tello.png";

const artworkImageMap: Record<string, string> = {
  "artworks/mvp-selected/01-musico-moche.png": Mvp01,
  "artworks/mvp-selected/02-botella-chimu-lambayeque.png": Mvp02,
  "artworks/mvp-selected/03-aribalo-inca.png": Mvp03,
  "artworks/mvp-selected/04-asiento-del-inca.png": Mvp04,
  "artworks/mvp-selected/05-botella-chavin-204002.png": Mvp05,
  "artworks/mvp-selected/06-obelisco-tello.png": Mvp06,
};

export function getArtworkImageSource(imagePath?: string | null) {
  if (!imagePath) {
    return null;
  }

  return artworkImageMap[imagePath] ?? null;
}
