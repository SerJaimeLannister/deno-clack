import { red } from "@std/fmt/colors";
Deno.stdin.setRaw(true);
let chunk = new Uint8Array(0);
let currentInput = "";
let cursorPosition = 0;
const reader = Deno.stdin.readable.getReader();

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
    currentInput = ""; // Clear the input for the next line
    cursorPosition = 0; // Reset cursor position
    await Deno.stdout.write(new TextEncoder().encode("\r")); // Move to the beginning of the next line
    continue;
  }

  // Handle Backspace (key code 127)
  if (key === 127) {
    if (cursorPosition > 0) {
      currentInput = currentInput.slice(0, cursorPosition - 1) +
        currentInput.slice(cursorPosition);
      cursorPosition--;
      // Clear the line and reprint the input
      await Deno.stdout.write(
        new TextEncoder().encode(
          "\r" + " ".repeat(currentInput.length + 1) + "\r",
        ),
      );
      await Deno.stdout.write(new TextEncoder().encode(red(currentInput)));
      // Move cursor back to correct position
      if (cursorPosition < currentInput.length) {
        await Deno.stdout.write(
          new TextEncoder().encode(
            "\u001b[" + (currentInput.length - cursorPosition) + "D",
          ),
        );
      }
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
          await Deno.stdout.write(new TextEncoder().encode("\u001b[D"));
        } else if (
          arrow.value[0] === 67 && cursorPosition < currentInput.length
        ) {
          // Right arrow
          cursorPosition++;
          await Deno.stdout.write(new TextEncoder().encode("\u001b[C"));
        }
      }
    }
    continue;
  }

  // Add character to the input
  const char = String.fromCharCode(key);
  currentInput = currentInput.slice(0, cursorPosition) + char +
    currentInput.slice(cursorPosition);
  cursorPosition++;

  // Clear the current line and reprint the input in red
  await Deno.stdout.write(new TextEncoder().encode("\r" + red(currentInput)));

  // Move cursor back to correct position if not at the end
  if (cursorPosition < currentInput.length) {
    await Deno.stdout.write(
      new TextEncoder().encode(
        "\u001b[" + (currentInput.length - cursorPosition) + "D",
      ),
    );
  }
}
