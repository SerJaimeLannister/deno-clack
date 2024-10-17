import { handleInput } from "./inputHandler.ts";
import { getRandomColorFn } from "./coloredInput.ts";
import { getRandomSuggestion } from "./suggestions.ts";

console.log(
  "Type something and press Enter. The color will change for each new line.",
);
console.log("When the input is empty, a suggestion will appear in gray.");
console.log("Press Ctrl+C to exit.");

await handleInput(
  (input: string) => {
    console.log("You entered:", input);
  },
  getRandomColorFn,
  getRandomSuggestion,
);

console.log("Input handling finished.");
