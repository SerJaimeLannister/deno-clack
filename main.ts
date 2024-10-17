// main.ts

import { handleInput } from "./inputHandler.ts";
import { rgb24 } from "@std/fmt/colors";

console.log(
  "Type something and press Enter. The color will change for each new line. Press Ctrl+C to exit.",
);

function getRandomColor() {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

await handleInput(
  (input: string) => {
    console.log("You entered:", input);
  },
  () => {
    const color = getRandomColor();
    return (text: string) => rgb24(text, color);
  },
);

console.log("Input handling finished.");
