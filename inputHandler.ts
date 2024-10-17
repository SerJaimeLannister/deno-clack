// inputHandler.ts

import { gray } from "@std/fmt/colors";

type ColorFunction = (text: string) => string;

let suggestionexist: boolean;

async function refreshDisplay(
  currentInput: string,
  cursorPosition: number,
  colorFn: ColorFunction,
  suggestion: string,
) {
  // Clear the current line
  await Deno.stdout.write(
    new TextEncoder().encode(
      "\r" + " ".repeat(Math.max(currentInput.length, suggestion.length) + 1),
    ),
  );
  // Move cursor back to the start of the line
  await Deno.stdout.write(new TextEncoder().encode("\r"));
  // Print the current input with the specified color
  await Deno.stdout.write(new TextEncoder().encode(colorFn(currentInput)));

  // If the input is empty, show the suggestion
  if (currentInput.length === 0) {
    suggestionexist = true;
    await Deno.stdout.write(new TextEncoder().encode(gray(suggestion)));
    // Move cursor back to the start of the line
    await Deno.stdout.write(new TextEncoder().encode("\r"));
  } else if (cursorPosition < currentInput.length) {
    // Move cursor to the correct position
    await Deno.stdout.write(
      new TextEncoder().encode(
        "\u001b[" + (currentInput.length - cursorPosition) + "D",
      ),
    );
    suggestionexist = false;
  }
}

export async function handleInput(
  onEnter: (input: string) => void,
  getColorFn: () => ColorFunction,
  getSuggestion: () => string,
): Promise<void> {
  Deno.stdin.setRaw(true);
  let chunk = new Uint8Array(0);
  let currentInput = "";
  let cursorPosition = 0;
  const reader = Deno.stdin.readable.getReader();
  let currentColorFn = getColorFn();
  let currentSuggestion = getSuggestion();

  try {
    await refreshDisplay(
      currentInput,
      cursorPosition,
      currentColorFn,
      currentSuggestion,
    );

    while (true) {
      if (chunk.length === 0) {
        const readResult = await reader.read();
        if (readResult.done) break;
        chunk = readResult.value;
        continue;
      }
      const key = chunk[0];
      chunk = chunk.slice(1);
      // console.log(key);
      // Handle Ctrl+C (key code 3)
      if (key === 3) {
        console.log();
        break;
      }

      // console.log(currentSuggestion);
      // Handle Enter (key code 13)
      if (key === 13) {
        console.log(); // Move to the next line
        onEnter(currentInput); // Call the provided callback with the current input
        currentInput = ""; // Clear the input for the next line
        cursorPosition = 0; // Reset cursor position
        currentColorFn = getColorFn(); // Get a new color function for the next line
        currentSuggestion = getSuggestion(); // Get a new suggestion for the next line
        await refreshDisplay(
          currentInput,
          cursorPosition,
          currentColorFn,
          currentSuggestion,
        );
        continue;
      }

      // Handle Backspace (key code 127)
      if (key === 127) {
        if (cursorPosition > 0) {
          currentInput = currentInput.slice(0, cursorPosition - 1) +
            currentInput.slice(cursorPosition);
          cursorPosition--;
          await refreshDisplay(
            currentInput,
            cursorPosition,
            currentColorFn,
            currentSuggestion,
          );
        }
        continue;
      }
      // Handle Tab (key code 9)
      if (key === 9 && suggestionexist == true) {
        currentInput += currentSuggestion; // Append the suggestion
        cursorPosition = currentInput.length; // Move cursor to the end of the new input
        await refreshDisplay(
          currentInput,
          cursorPosition,
          currentColorFn,
          currentSuggestion,
        );
        suggestionexist = false;
        continue;
      }

      // Handle arrow keys (left: 27, 91, 68 / right: 27, 91, 67)
      if (key === 27) {
        const next = await reader.read();
        if (next.value && next.value[0] === 91) {
          const arrow = await reader.read();
          if (arrow.value) {
            if (arrow.value[0] === 68 && cursorPosition > 0) {
              // Left arrow
              cursorPosition--;
              await refreshDisplay(
                currentInput,
                cursorPosition,
                currentColorFn,
                currentSuggestion,
              );
            } else if (
              arrow.value[0] === 67 && cursorPosition < currentInput.length
            ) {
              // Right arrow
              cursorPosition++;
              await refreshDisplay(
                currentInput,
                cursorPosition,
                currentColorFn,
                currentSuggestion,
              );
            }
          }
        }
        continue;
      }

      // Add character to the input at the cursor position
      const char = String.fromCharCode(key);
      currentInput = currentInput.slice(0, cursorPosition) + char +
        currentInput.slice(cursorPosition);
      cursorPosition++;

      await refreshDisplay(
        currentInput,
        cursorPosition,
        currentColorFn,
        currentSuggestion,
      );
    }
  } finally {
    Deno.stdin.setRaw(false);
    reader.releaseLock();
  }
}
