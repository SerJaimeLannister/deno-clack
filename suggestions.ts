// suggestions.ts

const words = [
  "night-rider",
  "cyber-punk",
  "deno-saurus",
  "typescript-wizard",
  "rust-bucket",
  "go-getter",
  "python-charmer",
  "java-junkie",
  "ruby-rascal",
  "c-sharp-shooter",
  "web-weaver",
  "code-conjurer",
  "algorithm-alchemist",
  "data-diver",
  "bug-buster",
  "cloud-surfer",
  "git-guru",
  "docker-dynamo",
  "linux-lover",
  "mac-maestro",
];

export function getRandomSuggestion(): string {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
