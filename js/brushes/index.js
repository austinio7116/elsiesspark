import PenBrush from './PenBrush.js';
import MarkerBrush from './MarkerBrush.js';
import EraserBrush from './EraserBrush.js';
import LineBrush from './LineBrush.js';
import GlitzBrush from './GlitzBrush.js';
import SprinklesBrush from './SprinklesBrush.js';
import VineBrush from './VineBrush.js';
import FairyLightsBrush from './FairyLightsBrush.js';
import RainbowBrush from './RainbowBrush.js';
import TreeBrush from './TreeBrush.js';
import WaterBrush from './WaterBrush.js';
import GrassBrush from './GrassBrush.js';
import FurBrush from './FurBrush.js';

const brushes = {
  pen: new PenBrush(),
  marker: new MarkerBrush(),
  eraser: new EraserBrush(),
  line: new LineBrush(),
  glitz: new GlitzBrush(),
  sprinkles: new SprinklesBrush(),
  vine: new VineBrush(),
  fairylights: new FairyLightsBrush(),
  rainbow: new RainbowBrush(),
  tree: new TreeBrush(),
  water: new WaterBrush(),
  grass: new GrassBrush(),
  fur: new FurBrush(),
};

export default brushes;
