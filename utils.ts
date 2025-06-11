
// Utility function to shuffle an array
export const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array) return [];
  return [...array].sort(() => Math.random() - 0.5);
};
    