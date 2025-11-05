import { router } from "../../trpc";
import { mealLogRouter } from "./meal-log.router";
import { routineLogRouter } from "./routine-log.router";
import { workoutLogRouter } from "./workout-log.router";

export const logRouter = router({
  meal: mealLogRouter,
  routine: routineLogRouter,
  workout: workoutLogRouter,
});
