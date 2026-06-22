import { Engine } from "./Engine";
import { toPosition } from "./utils/ConversionUtils";

const engine = new Engine();

engine.print();

console.log(toPosition("A5"));
