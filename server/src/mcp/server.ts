import z from "zod/v3";
import { format } from "util";
import { convertProductToMeal, searchFood } from "@motus/openfoodfacts";
import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { and, eq, gte, ilike, isNull, lte, or, inArray } from "drizzle-orm";

import { db } from "../instances";
import { mealLogInsertSchema, mealSelectSchema } from "../db/zod";
import { exercises, mealLogs, meals, routines, users } from "../db/schema";
import { getExercisesWhere } from "../routers/exercises/exercise.controller";

let server: McpServer | undefined;

export const createMcpServer = () => {
  if (server) return server.server;

  server = new McpServer({
    name: "Motus MCP Server",
    version: "0.0.0",
  });

  server.registerResource(
    "muscles",
    new ResourceTemplate("data://muscles", { list: undefined }),
    {
      title: "Get muscles",
      description: "A collection of available muscles.",
    },
    async (uri) => {
      const allMuscles = await db.query.muscles.findMany();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(allMuscles),
          },
        ],
      };
    },
  );

  server.registerResource(
    "equipments",
    new ResourceTemplate("data://equipments", { list: undefined }),
    {
      title: "Get equipments",
      description: "A collection of available equipmemts.",
    },
    async (uri) => {
      const allEquipments = await db.query.equipments.findMany();
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(allEquipments),
          },
        ],
      };
    },
  );

  server.registerResource(
    "user",
    new ResourceTemplate("user://{userId}", { list: undefined }),
    {},
    async (uri, { userId }) => {
      const user = await db.query.users.findFirst({
        columns: {
          id: true,
          profile: true,
        },
        where: eq(users.id, userId as string),
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(user),
          },
        ],
      };
    },
  );

  server.registerResource(
    "exercises",
    new ResourceTemplate("user://{userId}/exercises", { list: undefined }),
    {
      title: "Get user exercises",
      description: "A collection of available exercises for a specific user.",
    },
    async (uri, { userId }) => {
      const allExercises = await getExercisesWhere(
        db,
        or(isNull(exercises.user), eq(exercises.user, userId as string)),
      );
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(allExercises),
          },
        ],
      };
    },
  );

  server.registerResource(
    "logs",
    new ResourceTemplate("user//{userId}/logs{?type,startDate,endDate}", {
      list: undefined,
    }),
    {
      title: "User Logs",
      description:
        "Filterable collection of meald, routines, workouts logs for a user.",
    },
    async (uri, { userId, type, startDate, endDate }) => {
      const data = logSelectSchema
        .pick({ user: true, type: true })
        .parse({ user: userId, type });
      const where = [];

      const dateParser = z.union([z.date(), z.number(), z.string().datetime()]);

      if (startDate) {
        const start = new Date(dateParser.parse(startDate));
        where.push(gte(logs.createdAt, start));
      }
      if (endDate) {
        const end = new Date(dateParser.parse(endDate));
        where.push(lte(logs.createdAt, end));
      }

      const allLogs = db.query.logs.findMany({
        with: {
          routine: {
            columns: {
              id: true,
            },
          },
        },
        columns: {
          routine: false,
        },
        where: and(
          eq(logs.user, data.user),
          eq(logs.type, data.type),
          ...where,
        ),
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(allLogs),
          },
        ],
      };
    },
  );

  server.registerResource(
    "meals",
    new ResourceTemplate("user://{userId}/meals{?name}", { list: undefined }),
    {
      title: "Search meals",
      description: "Filterable collection of meals for a user.",
    },
    async (uri, { userId, name }) => {
      const data = mealSelectSchema
        .pick({ user: true, name: true, brandName: true })
        .parse({
          name,
          user: userId,
          brandName: name,
        });
      const allMeals = db.query.meals.findMany({
        where: and(
          eq(meals.user, data.user!),
          or(
            eq(meals.name, format("%%%s%%", data.name)),
            ilike(meals.brandName, format("%%%s%%", data.brandName)),
          ),
        ),
      });

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(allMeals),
          },
        ],
      };
    },
  );

  server.registerTool(
    "create-exercise",
    {
      title: "Create Exercise",
      description: "Create a new custom exercise for a user.",
      inputSchema: {
        user: z.string().uuid(),
        note: z.string().optional(),
        image: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
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
    async () => {
      const [exercise] = await db
        .insert(exercises)
        .values(data)
        .returning()
        .execute();

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(exercise),
          },
        ],
      };
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
                    .record(z.string(), z.number().optional())
                    .describe(
                      "Object.fromEntries(exercise.exercise_type.map(key => [key, undefined])) to generate sets",
                    ),
                )
                .optional()
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
      const allExercises = await db.query.exercises.findMany({
        where: inArray(
          exercises.id,
          args.metadata.exercises
            .filter((exercise) => !exercise.sets)
            .map((exercise) => exercise.id),
        ),
      });
      args.metadata.exercises = args.metadata.exercises
        .map((exercise) => {
          if (exercise.sets) return exercise;

          const dbExercise = allExercises.find(
            (value) => value.id === exercise.id,
          );

          if (dbExercise)
            return {
              ...exercise,
              sets: [
                Object.fromEntries(
                  dbExercise.exercise_types.map((key) => [key, null]),
                ),
              ],
            };

          return null;
        })
        .filter(Boolean);

      const [routine] = await db
        .insert(routines)
        .values(args)
        .returning()
        .execute();

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(routine),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search-food",
    {
      title: "Search food",
      description:
        "Search for a food and return list of related foods. To be used with add-food tool",
      inputSchema: {
        name: z.string(),
        limit: z.number().default(24).optional(),
        offet: z.number().default(1).optional(),
      },
    },
    async ({ name, ...args }) => {
      const data = await searchFood(name, args);

      if (data.products) {
        const meals = data.products.map(convertProductToMeal);

        return {
          content: [
            {
              type: "text",
              mimeType: "application/json",
              text: JSON.stringify(meals),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: "Can't find a match for this food.",
          },
        ],
      };
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
            portionSize: z.object({
              value: z.number(),
              unit: z
                .string()
                .describe("portion unit e.g cup, litre, kg, g, sachet"),
            }),
            nutriments: z
              .record(
                z.string(),
                z.object({
                  value: z.number(),
                  unit: z.string().describe("Nutrient unit e.g kcal, g, cal,"),
                }),
              )
              .describe("Meal nutriments"),
          })
          .describe("meal metedata"),
      },
    },
    async (args) => {
      const [meal] = await db.insert(meals).values(args).returning().execute();
      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(meal),
          },
        ],
      };
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
      const data = mealLogInsertSchema.parse({ ...args, type: "meal" });
      const [meal] = await db.insert(mealLogs).values(data).returning();

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(meal),
          },
        ],
      };
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
            .optional(),
          goalWeight: z
            .object({
              value: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .optional(),
          currentWeight: z
            .object({
              value: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .optional(),
          startingWeight: z
            .object({
              value: z.number(),
              date: z.number(),
              unit: z.enum(["kg", "ibs"]),
            })
            .optional(),
          activityLevel: z
            .enum([
              "not-very-active",
              "lightly-active",
              "active",
              "very-active",
            ])
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
              goals: { ...user.profile.goals, ...args.goals },
            },
          })
          .where(eq(users.id, args.userId))
          .returning()
          .execute();

        return {
          type: "text",
          mimeType: "application/json",
          text: JSON.stringify(user),
        };
      }

      return {
        type: "text",
        text: "user not found.",
      };
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

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(allMuscles),
          },
        ],
      };
    },
  );

  server.registerResource(
    "get-equipments",
    {
      title: "Get equipments",
      description: "A collection of available equipmemts.",
    },
    async () => {
      const allEquipments = await db.query.equipments.findMany();

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(allEquipments),
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(user),
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(allExercises),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get-logs",
    {
      title: "User Logs",
      description:
        "Filterable collection of meald, routines, workouts logs for a user.",
      inputSchema: {
        userId: z.string(),
        type: z.enum("meal", "routine", "exercise"),
        endDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
        startDate: z
          .union([z.date(), z.number(), z.string().datetime()])
          .optional(),
      },
    },
    async ({ userId, type, startDate, endDate }) => {
      const where = [];

      if (endDate) where.push(lte(logs.createdAt, endDate));
      if (startDate) where.push(gte(logs.createdAt, startDate));

      const allLogs = await db.query.logs
        .findMany({
          with: {
            routine: {
              columns: {
                id: true,
              },
            },
          },
          columns: {
            routine: false,
          },
          where: and(eq(logs.user, userId), eq(logs.type, type), ...where),
        })
        .execute();

      return {
        contents: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(allLogs),
          },
        ],
      };
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

      return {
        content: [
          {
            type: "text",
            mimeType: "application/json",
            text: JSON.stringify(allMeals),
          },
        ],
      };
    },
  );

  return server.server;
};
