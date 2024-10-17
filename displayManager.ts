import { ColorFunction } from "./coloredInput.ts";
import { gray } from "@std/fmt/colors";

export async function refreshDisplay(
  currentInput: string,
  cursorPosition: number,
  colorFn: ColorFunction,
  suggestion?: string,
): Promise<void> {
  const encoder = new TextEncoder();

  // Clear the current line
  await Deno.stdout.write(
    encoder.encode(
      "\r" +
        " ".repeat(Math.max(currentInput.length, suggestion?.length || 0) + 1),
    ),
  );

  // Move cursor back to the start of the line
  await Deno.stdout.write(encoder.encode("\r"));

  // Print the current input with the specified color
  await Deno.stdout.write(encoder.encode(colorFn(currentInput)));

  // If there's a suggestion and the input is empty, show the suggestion
  if (suggestion && currentInput.length === 0) {
    await Deno.stdout.write(encoder.encode(gray(suggestion)));
    await Deno.stdout.write(encoder.encode("\r"));
  }

  // Move cursor to the correct position
  if (cursorPosition < currentInput.length) {
    await Deno.stdout.write(
      encoder.encode(`\u001b[${currentInput.length - cursorPosition}D`),
    );
  }
}
