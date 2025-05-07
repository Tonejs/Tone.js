import { getDestination } from "tone/no-side-effects";
import { Player } from "tone/source/buffer/Player";

const player = new Player();
player.connect(getDestination());
