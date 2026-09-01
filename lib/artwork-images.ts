// Importar todas las imágenes explícitamente para que el bundler las incluya
import Mvp01 from "@/assets/images/artworks/uni-mvp/01-escritorio-habich.png";
import Mvp02 from "@/assets/images/artworks/uni-mvp/02-maquina-escribir.png";
import Mvp03 from "@/assets/images/artworks/uni-mvp/03-miguel-grau.png";
import Mvp04 from "@/assets/images/artworks/uni-mvp/04-san-martin.png";
import Ancient01 from "@/assets/images/artworks/mvp-selected/01-musico-moche.png";
import Ancient02 from "@/assets/images/artworks/mvp-selected/02-botella-chimu-lambayeque.png";
import Ancient03 from "@/assets/images/artworks/mvp-selected/03-aribalo-inca.png";
import Ancient04 from "@/assets/images/artworks/mvp-selected/04-asiento-del-inca.png";
import Ancient05 from "@/assets/images/artworks/mvp-selected/05-botella-chavin-204002.png";
import Ancient06 from "@/assets/images/artworks/mvp-selected/06-obelisco-tello.png";
import Azurita from "@/assets/images/artworks/uni-mvp/minerals/azurita.png";
import Bornita from "@/assets/images/artworks/uni-mvp/minerals/bornita.png";
import Esfalerita from "@/assets/images/artworks/uni-mvp/minerals/esfalerita.png";
import Galena from "@/assets/images/artworks/uni-mvp/minerals/galena.png";
import Magnetita from "@/assets/images/artworks/uni-mvp/minerals/magnetita.png";
import Malaquita from "@/assets/images/artworks/uni-mvp/minerals/malaquita.png";
import Oro from "@/assets/images/artworks/uni-mvp/minerals/oro.png";
import Pirita from "@/assets/images/artworks/uni-mvp/minerals/pirita.png";
import Plata from "@/assets/images/artworks/uni-mvp/minerals/plata.png";
import Wolframita from "@/assets/images/artworks/uni-mvp/minerals/wolframita.png";

const artworkImageMap: Record<string, string> = {
  "artworks/uni-mvp/01-escritorio-habich.png": Mvp01,
  "artworks/uni-mvp/02-maquina-escribir.png": Mvp02,
  "artworks/uni-mvp/03-miguel-grau.png": Mvp03,
  "artworks/uni-mvp/04-san-martin.png": Mvp04,
  "artworks/uni-mvp/minerals/azurita.png": Azurita,
  "artworks/uni-mvp/minerals/bornita.png": Bornita,
  "artworks/uni-mvp/minerals/esfalerita.png": Esfalerita,
  "artworks/uni-mvp/minerals/galena.png": Galena,
  "artworks/uni-mvp/minerals/magnetita.png": Magnetita,
  "artworks/uni-mvp/minerals/malaquita.png": Malaquita,
  "artworks/uni-mvp/minerals/oro.png": Oro,
  "artworks/uni-mvp/minerals/pirita.png": Pirita,
  "artworks/uni-mvp/minerals/plata.png": Plata,
  "artworks/uni-mvp/minerals/wolframita.png": Wolframita,
  "artworks/mvp-selected/01-musico-moche.png": Ancient01,
  "artworks/mvp-selected/02-botella-chimu-lambayeque.png": Ancient02,
  "artworks/mvp-selected/03-aribalo-inca.png": Ancient03,
  "artworks/mvp-selected/04-asiento-del-inca.png": Ancient04,
  "artworks/mvp-selected/05-botella-chavin-204002.png": Ancient05,
  "artworks/mvp-selected/06-obelisco-tello.png": Ancient06,
};

export function getArtworkImageSource(imagePath?: string | null) {
  if (!imagePath) {
    return null;
  }

  return artworkImageMap[imagePath] ?? null;
}
