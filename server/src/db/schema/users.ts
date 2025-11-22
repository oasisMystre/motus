import {
  boolean,
  jsonb,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

type Profile = {
  avatar: string;
  gender: "male" | "female" | "others";
  height: {
    unit: "cm" | "in";
    value: number;
  };
  weight: {
    unit: "ibs" | "kg";
    value: number;
  };
  age: Date;
  location: number;
  steps: number;
  goals: {
    goalWeight: {
      value: number;
      unit: "ibs" | "kg";
    };
    weeklyGoal: {
      value: number;
      unit: "ibs" | "kg";
    };
    currentWeight: {
      value: number;
      unit: "ibs" | "kg";
    };
    activityLevel:
      | "not-very-active"
      | "lightly-active"
      | "active"
      | "very-active";
    startingWeight: {
      value: number;
      unit: "ibs" | "kg";
      date: number;
    };
  };
};

type Settings = {
  notifications: {
    follow: boolean;
    like: {
      post: boolean;
      comment: boolean;
    };
    comment: {
      workout: boolean;
      reply: boolean;
      mention: boolean;
    };
    discussion: {
      workout: boolean;
    };
  };
};

export const users = pgTable(
  "users",
  {
    name: text(),
    email: text().unique("email", { nulls: "not distinct" }),
    username: text().unique("username", { nulls: "not distinct" }),
    uid: text().unique().notNull(),
    id: uuid().defaultRandom().primaryKey(),
    disabled: boolean().default(false).notNull(),
    settings: jsonb()
      .$type<Settings>()
      .default({
        notifications: {
          follow: true,
          like: {
            post: true,
            comment: true,
          },
          comment: {
            workout: true,
            reply: true,
            mention: true,
          },
          discussion: {
            workout: true,
          },
        },
      })
      .notNull(),
    profile: jsonb()
      .$type<Omit<Partial<Profile>, "steps"> & { steps: number }>()
      .default({ steps: 3000 })
      .notNull(),
    emailVerified: boolean().default(false).notNull(),
  },
  (column) => [
    {
      unique_id_and_email: unique()
        .on(column.uid, column.email)
        .nullsNotDistinct(),
    },
  ],
);
