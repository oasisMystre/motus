import z from "zod/v3";
import moment from "moment";
import { format } from "util";
import merge from "lodash.merge";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { and, eq, gte, ilike, isNull, lte, or } from "drizzle-orm";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";
import {
  McpServer,
  type RegisteredTool,
} from "@modelcontextprotocol/sdk/server/mcp.js";

import { db } from "../instances";
import { getExercisesWhere } from "../routers/exercises/exercise.controller";
import {
  exercises,
  mealLogs,
  meals,
  routineLogs,
  routines,
  users,
  workoutLogs,
} from "../db/schema";

let server: McpServer | undefined;

const jsonOutput = async <T extends object, U extends z.ZodType>(
  value: T,
  validator?: U,
) => {
  const result = validator ? await validator?.parseAsync(value) : value;
  return {
    structuredContent: { result },
    content: [{ type: "text" as const, text: JSON.stringify({ result }) }],
  } satisfies ReturnType<RegisteredTool["callback"]>;
};

export const createMcpServer = () => {
  if (server) return server.server;

  server = new McpServer({
    name: "Motus MCP Server",
    version: "0.0.0",
  });

  server.registerTool(
    "create-exercise",
    {
      title: "Create Exercise",
      description: "Create a new custom exercise for a user.",
      inputSchema: {
        user: z.string().uuid(),
        name: z.string(),
        note: z.string().optional(),
        image: z.string().optional(),
        metadata: z.record(z.string(), z.any()).default({}),
        equipment: z.string().uuid().describe("exercise equiment id"),
        primary_muscle_group: z
          .string()
          .uuid()
          .describe("exercise primary muscle id"),
        other_muscles: z
          .array(z.string().uuid())
          .describe("exercise muscle ids"),
        exercise_types: z
          .array(z.enum(["time", "reps", "weight", "distance"]))
          .describe("exercise measurement types"),
      },
    },
    async (data) => {
      const [exercise] = await db
        .insert(exercises)
        .values(data)
        .returning()
        .execute();
      if (exercise) return jsonOutput(exercise);

      throw new McpError(404, "exercise not created");
    },
  );

  server.registerTool(
    "create-routine",
    {
      title: "Create Routine",
      description: "Create a new workout routine for a user",
      inputSchema: {
        user: z.string().uuid().describe("user id"),
        name: z.string().describe("routine name"),
        metadata: z.object({
          exercises: z.array(
            z.object({
              id: z.string().uuid().describe("exercise id"),
              note: z.string().optional().describe("exercise note"),
              sets: z
                .array(
                  z
                    .record(z.string(), z.union([z.string(), z.boolean()]))
                    .describe("prefill exercise set info"),
                )
                .describe("template for routine logging."),
              restTimer: z
                .number()
                .optional()
                .describe("exercise rest time in milliseconds"),
            }),
          ),
        }),
      },
    },
    async (args) => {
      const [routine] = await db
        .insert(routines)
        .values(args)
        .returning()
        .execute();
      if (routine) return jsonOutput(routine);

      throw new McpError(404, "routine not created");
    },
  );

  server.registerTool(
    "get-foods",
    {
      title: "Search food",
      description:
        "Search for a food and return list of related foods. To be used with add-food tool",
      inputSchema: {
        name: z.string(),
        page: z.number().default(24).optional(),
        page_size: z.number().default(1).optional(),
      },
    },
    async ({ name, ...args }) => {
      const data = await searchFood(name, args);

      if (data.products) {
        const meals = data.products.map(convertProductToMeal);
        return jsonOutput(meals);
      }

      throw new McpError(404, "food not found.");
    },
  );

  server.registerTool(
    "add-meal",
    {
      title: "Add meal",
      description: "Add a meal with nutriments data for a user.",
      inputSchema: {
        name: z.string().describe("Meal name"),
        user: z.string().uuid().describe("user Id"),
        brandName: z.string().optional().describe("Meal brandName"),
        metadata: z
          .object({
            portion: z.object({
              count: z.number(),
              size: z.object({
                value: z.number(),
                unit: z.enum(["kg", "g", "cup", "litre", "bag", "sachet"]),
              }),
            }),
            nutriments: z
              .record(
                z.string(),
                z.object({
                  value: z.number(),
                  unit: z.enum(["g", "mg", "%", "cal", "kcal"]),
                }),
              )
              .describe("Meal nutriments"),
          })
          .describe("meal metedata"),
      },
    },
    async (args) => {
      const [meal] = await db.insert(meals).values(args).returning().execute();
      if (meal) return jsonOutput(meal);
      throw new McpError(404, "meal not created");
    },
  );

  server.registerTool(
    "log-meal",
    {
      title: "Log meal",
      description: "Log meal with comprehensive info about meal nutrients.",
      inputSchema: {
        user: z.string().uuid(),
        name: z.string(),
        meals: z.string().array().describe("meals id"),
        image: z.string().optional(),
        category: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        metadata: z.object({
          fats: z.object({
            value: z.number(),
            unit: z.enum(["g"]),
          }),
          energy: z.object({
            value: z.number(),
            unit: z.enum(["kcal"]),
          }),
          proteins: z.object({
            value: z.number(),
            unit: z.enum(["g"]),
          }),
          carbohydrates: z.object({
            value: z.number(),
            unit: z.enum(["g"]),
          }),
        }),
      },
    },
    async (args) => {
      const [meal] = await db.insert(mealLogs).values(args).returning();
      if (meal) return jsonOutput(meal);
      throw new McpError(404, "meal not found");
    },
  );

  server.registerTool(
    "update-goals",
    {
      title: "Update user goal",
      description: "update user goal with recommended values",
      inputSchema: {
        userId: z.string().uuid(),
        goals: z.object({
          weeklyGoal: z
            .object({
              value: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .describe("calculated user weekly weight loss or gain goal")
            .optional(),
          goalWeight: z
            .object({
              value: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .describe("user weight loss or gain target goal")
            .optional(),
          currentWeight: z
            .object({
              value: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .describe("current user weight")
            .optional(),
          startingWeight: z
            .object({
              value: z.number(),
              date: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .describe("user starting weight")
            .optional(),
          activityLevel: z
            .enum([
              "not-very-active",
              "lightly-active",
              "active",
              "very-active",
            ])
            .describe("user activity level")
            .optional(),
        }),
      },
    },
    async (args) => {
      let user = await db.query.users
        .findFirst({
          where: eq(users.id, args.userId),
        })
        .execute();

      if (user) {
        [user] = await db
          .update(users)
          .set({
            profile: {
              ...user.profile,
              goals: merge(user.profile.goals, args.goals),
            },
          })
          .where(eq(users.id, args.userId))
          .returning()
          .execute();
        if (user) return jsonOutput(user);
      }

      throw new McpError(404, "user not found");
    },
  );

  server.registerTool(
    "search-food",
    {
      title: "Search food or meal with openfoodfact",
      description: "Return a list of meal search result",
      inputSchema: {
        query: z
          .array(z.string())
          .describe("List of meal or food name to get from openfoodfact"),
      },
    },
    async (args) => {
      const response = await searchFood(args.query.join(","));
      return jsonOutput(response.products.map(convertProductToMeal));
    },
  );

  server.registerTool(
    "get-muscles",
    {
      title: "Get muscles",
      description: "A collection of available muscles.",
    },
    async () => {
      const allMuscles = await db.query.muscles.findMany();

      return jsonOutput(allMuscles);
    },
  );

  server.registerTool(
    "get-equipments",
    {
      title: "Get equipments",
      description: "A collection of available equipmemts.",
    },
    async () => {
      const allEquipments = await db.query.equipments.findMany();

      return jsonOutput(allEquipments);
    },
  );

  server.registerTool(
    "get-user",
    {
      title: "Get user",
      description: "Retrieve a user info",
      inputSchema: {
        userId: z.string().uuid(),
      },
    },
    async ({ userId }) => {
      const user = await db.query.users
        .findFirst({
          columns: {
            id: true,
            profile: true,
          },
          where: eq(users.id, userId),
        })
        .execute();
      if (user) return jsonOutput(user);
      throw new McpError(404, "user not found.");
    },
  );

  server.registerTool(
    "get-exercises",
    {
      title: "Get user exercises",
      description: "A collection of available exercises for a specific user.",
      inputSchema: {
        userId: z.string().uuid(),
      },
    },
    async ({ userId }) => {
      const allExercises = await getExercisesWhere(
        db,
        or(isNull(exercises.user), eq(exercises.user, userId as string)),
      );

      return jsonOutput(allExercises);
    },
  );

  server.registerTool(
    "meal-logs",
    {
      title: "Meal Logs",
      description: "Filterable collection of meals logs for a user.",
      inputSchema: {
        userId: z.string(),
        endDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
        startDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
      },
    },
    async ({ userId, startDate, endDate }) => {
      const where = [];
      if (endDate)
        where.push(lte(mealLogs.createdAt, moment(endDate).toDate()));
      if (startDate)
        where.push(gte(mealLogs.createdAt, moment(startDate).toDate()));

      const allLogs = await db.query.mealLogs
        .findMany({
          where: and(eq(mealLogs.user, userId), ...where),
        })
        .execute();

      return jsonOutput(allLogs);
    },
  );

  server.registerTool(
    "routine-logs",
    {
      title: "Routine Logs",
      description: "Filterable collection of routine logs for a user.",
      inputSchema: {
        userId: z.string(),
        endDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
        startDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
      },
    },
    async ({ userId, startDate, endDate }) => {
      const where = [];
      if (endDate)
        where.push(lte(routineLogs.createdAt, moment(endDate).toDate()));
      if (startDate)
        where.push(gte(routineLogs.createdAt, moment(startDate).toDate()));

      const allLogs = await db.query.routineLogs
        .findMany({
          where: and(eq(mealLogs.user, userId), ...where),
        })
        .execute();

      return jsonOutput(allLogs);
    },
  );

  server.registerTool(
    "workout-logs",
    {
      title: "Workout Logs",
      description: "Filterable collection of workout logs for a user.",
      inputSchema: {
        userId: z.string(),
        endDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
        startDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
      },
    },
    async ({ userId, startDate, endDate }) => {
      const where = [];
      if (endDate)
        where.push(lte(workoutLogs.createdAt, moment(endDate).toDate()));
      if (startDate)
        where.push(gte(workoutLogs.createdAt, moment(startDate).toDate()));

      const allLogs = await db.query.mealLogs
        .findMany({
          where: and(eq(workoutLogs.user, userId), ...where),
        })
        .execute();

      return jsonOutput(allLogs);
    },
  );

  server.registerTool(
    "get-meals",
    {
      title: "Search meals",
      description: "Filterable collection of meals for a user.",
      inputSchema: {
        userId: z.string().uuid(),
        name: z.string().optional(),
        brandName: z.string().optional(),
      },
    },
    async ({ userId, brandName, name }) => {
      const allMeals = await db.query.meals
        .findMany({
          where: and(
            eq(meals.user, userId),
            or(
              eq(meals.name, format("%%%s%%", name)),
              ilike(meals.brandName, format("%%%s%%", brandName)),
            ),
          ),
        })
        .execute();

      return jsonOutput(allMeals);
    },
  );

  return server.server;
};
