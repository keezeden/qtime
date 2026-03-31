export function getTenSecondBlocksSince(inputTime: Date | number | string): number {
  const start = new Date(inputTime).getTime(); // ms
  const now = Date.now(); // ms

  const secondsPassed = Math.floor((now - start) / 1000);
  const tenSecondBlocks = Math.floor(secondsPassed / 10);

  return tenSecondBlocks;
}
