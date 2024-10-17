import { rgb24 } from "@std/fmt/colors";

export type ColorFunction = (text: string) => string;

export function getRandomColorFn(): ColorFunction {
  const color = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
  return (text: string) => rgb24(text, color);
}
