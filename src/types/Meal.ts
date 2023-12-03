export default interface Meal {
  day: string;
  date: string;
  time: string;
  type: "Breakfast" | "Dinner";
  catererName: string;
  mealDescription: string;
}
