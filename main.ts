// main.ts

import { handleInput } from "./inputHandler.ts";
import { rgb24 } from "@std/fmt/colors";
import { getRandomSuggestion } from "./suggestions.ts";

console.log(
  "Type something and press Enter. The color will change for each new line.",
);
console.log("When the input is empty, a suggestion will appear in gray.");
console.log("Press Ctrl+C to exit.");

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
  getRandomSuggestion,
);

console.log("Input handling finished.");
