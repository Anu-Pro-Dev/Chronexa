export function generateRandomPassword(length = 8): string {
  if (length < 3) {
    throw new Error("Password length must be at least 3");
  }

  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  // First character must be uppercase
  let password = upper.charAt(Math.floor(Math.random() * upper.length));

  // Decide number count (min 1, max 3)
  const numberCount = Math.min(
    3,
    Math.max(1, Math.floor(Math.random() * 3) + 1)
  );

  const remainingLength = length - 1;
  const remainingNumbers = numberCount;
  const remainingLetters = remainingLength - remainingNumbers;

  let chars: string[] = [];

  // Add numbers
  for (let i = 0; i < remainingNumbers; i++) {
    chars.push(numbers.charAt(Math.floor(Math.random() * numbers.length)));
  }

  // Add letters
  for (let i = 0; i < remainingLetters; i++) {
    const pool = lower + upper;
    chars.push(pool.charAt(Math.floor(Math.random() * pool.length)));
  }

  // Shuffle remaining characters
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return password + chars.join("");
}
