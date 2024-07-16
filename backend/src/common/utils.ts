export function removeWhitespaces(input: string): string {
  return input.replace(/\s+/g, "");
}

export function getChunkFilePath(
  chunkDir: string,
  originalFilename: string,
  currentChunk: number
): string {
  return `${chunkDir}/${originalFilename}.${currentChunk}`;
}
