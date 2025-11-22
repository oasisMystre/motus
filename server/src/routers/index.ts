import { router } from "../trpc";

import { mcpRouter } from "./mcp/mcp.router";
import { logRouter } from "./logs/log.router";

import { postRouter } from "./posts/post.router";
import { userRouter } from "./users/user.router";
import { mealRouter } from "./meals/meal.router";
import { followRouter } from "./follows/follow.router";
import { rewardRouter } from "./rewards/reward.router";
import { streakRouter } from "./streaks/streak.router";
import { muscleRouter } from "./muscles/muscle.router";
import { routineRouter } from "./routines/routine.router";
import { messageRouter } from "./messages/message.router";
import { exerciseRouter } from "./exercises/exercise.router";
import { equipmentRouter } from "./equipments/equipment.router";
import { notificationRouter } from "./notifications/notification.route";

export const appRouter = router({
  mcp: mcpRouter,
  log: logRouter,
  user: userRouter,
  post: postRouter,
  meal: mealRouter,
  streak: streakRouter,
  follow: followRouter,
  muscle: muscleRouter,
  reward: rewardRouter,
  routine: routineRouter,
  message: messageRouter,
  exercise: exerciseRouter,
  equipment: equipmentRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
