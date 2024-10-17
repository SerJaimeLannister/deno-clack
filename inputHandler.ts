// inputHandler.ts

// import { rgb24 } from "@std/fmt/colors";

type ColorFunction = (text: string) => string;

async function refreshDisplay(
  currentInput: string,
  cursorPosition: number,
  colorFn: ColorFunction,
) {
  // Clear the current line
  await Deno.stdout.write(
    new TextEncoder().encode("\r" + " ".repeat(currentInput.length + 1)),
  );
  // Move cursor back to the start of the line
  await Deno.stdout.write(new TextEncoder().encode("\r"));
  // Print the current input with the specified color
  await Deno.stdout.write(new TextEncoder().encode(colorFn(currentInput)));
  // Move cursor to the correct position
  if (cursorPosition < currentInput.length) {
    await Deno.stdout.write(
      new TextEncoder().encode(
        "\u001b[" + (currentInput.length - cursorPosition) + "D",
      ),
    );
  }
}

export async function handleInput(
  onEnter: (input: string) => void,
  getColorFn: () => ColorFunction,
): Promise<void> {
  Deno.stdin.setRaw(true);
  let chunk = new Uint8Array(0);
  let currentInput = "";
  let cursorPosition = 0;
  const reader = Deno.stdin.readable.getReader();
  let currentColorFn = getColorFn();

  try {
    while (true) {
      if (chunk.length === 0) {
        const readResult = await reader.read();
        if (readResult.done) break;
        chunk = readResult.value;
        continue;
      }
      const key = chunk[0];
      chunk = chunk.slice(1);

      // Handle Ctrl+C (key code 3)
      if (key === 3) {
        console.log();
        break;
      }

      // Handle Enter (key code 13)
      if (key === 13) {
        console.log(); // Move to the next line
        onEnter(currentInput); // Call the provided callback with the current input
        currentInput = ""; // Clear the input for the next line
        cursorPosition = 0; // Reset cursor position
        currentColorFn = getColorFn(); // Get a new color function for the next line
        await Deno.stdout.write(new TextEncoder().encode("\r")); // Move to the beginning of the next line
        continue;
      }

      // Handle Backspace (key code 127)
      if (key === 127) {
        if (cursorPosition > 0) {
          currentInput = currentInput.slice(0, cursorPosition - 1) +
            currentInput.slice(cursorPosition);
          cursorPosition--;
          await refreshDisplay(currentInput, cursorPosition, currentColorFn);
        }
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

      await refreshDisplay(currentInput, cursorPosition, currentColorFn);
    }
  } finally {
    Deno.stdin.setRaw(false);
    reader.releaseLock();
  }
}
