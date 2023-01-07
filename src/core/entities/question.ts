export type Question = {
  id: string;
  points: number;
  title: string;
  options: string[];
  correctOptionIndex: number;
  time?: number;
  startedAt?: number;
};
