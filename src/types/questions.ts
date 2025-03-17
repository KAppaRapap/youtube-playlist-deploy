export interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
  }[];
}
