import { refreshDisplay } from "./displayManager.ts";
import { ColorFunction } from "./coloredInput.ts";

export async function handleInput(
  onEnter: (input: string) => void,
  getColorFn: () => ColorFunction,
  getSuggestion?: () => string,
): Promise<void> {
  Deno.stdin.setRaw(true);
  let currentInput = "";
  let cursorPosition = 0;
  const reader = Deno.stdin.readable.getReader();
  let currentColorFn = getColorFn();
  let currentSuggestion = getSuggestion?.();

  try {
    await refreshDisplay(
      currentInput,
      cursorPosition,
      currentColorFn,
      currentSuggestion,
    );

    while (true) {
      const { value: chunk, done } = await reader.read();
      if (done) break;

      for (let i = 0; i < chunk.length; i++) {
        const key = chunk[i];

        if (key === 3) { // Ctrl+C
          console.log();
          return;
        }

        if (key === 13) { // Enter
          console.log();
          onEnter(currentInput);
          currentInput = "";
          cursorPosition = 0;
          currentColorFn = getColorFn(); // Change color function only after Enter
          currentSuggestion = getSuggestion?.();
        } else if (key === 127) { // Backspace
          if (cursorPosition > 0) {
            currentInput = currentInput.slice(0, cursorPosition - 1) +
              currentInput.slice(cursorPosition);
            cursorPosition--;
          }
        } else if (key === 9) { // Tab
          if (currentSuggestion && currentInput.length === 0) {
            currentInput = currentSuggestion;
            cursorPosition = currentInput.length;
            currentSuggestion = getSuggestion?.();
          }
        } else if (key === 27) { // Escape (start of arrow key sequence)
          if (i + 2 < chunk.length && chunk[i + 1] === 91) {
            if (chunk[i + 2] === 68) { // Left arrow
              if (cursorPosition > 0) {
                cursorPosition--;
              }
              i += 2; // Skip the next two bytes
            } else if (chunk[i + 2] === 67) { // Right arrow
              if (cursorPosition < currentInput.length) {
                cursorPosition++;
              }
              i += 2; // Skip the next two bytes
            }
          }
        } else {
          // Add character to the input at the cursor position
          const char = String.fromCharCode(key);
          currentInput = currentInput.slice(0, cursorPosition) + char +
            currentInput.slice(cursorPosition);
          cursorPosition++;
        }

        await refreshDisplay(
          currentInput,
          cursorPosition,
          currentColorFn,
          currentSuggestion,
        );
      }
    }
  } finally {
    Deno.stdin.setRaw(false);
    reader.releaseLock();
  }
}
