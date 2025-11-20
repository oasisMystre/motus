import z from "zod";
import { Formik } from "formik";
import { useMemo } from "react";
import { mealLogInsertSchema, mealSelectSchema } from "@motus/server";
import { router, Stack, useLocalSearchParams } from "expo-router";

import { withZodSchema } from "../../../../../utils";
import { useAppDispatch } from "../../../../../store";
import { useMeal } from "../../../../../hooks/useMeal";
import { BackButton } from "../../../../../components/Header";
import { logActions } from "../../../../../store/log";
import { useTRPCClient } from "../../../../../providers/TRPCProvider";

const mealFormSchema = mealLogInsertSchema
  .omit({ user: true, meals: true })
  .extend({
    meals: z.array(mealSelectSchema).min(1),
  });

export default function LogMealLayout() {
  const trpc = useTRPCClient();
  const dispatch = useAppDispatch();
  const { id, action } = useLocalSearchParams<{
    id?: string;
    action?: "edit" | "duplicate";
  }>();

  const meal = useMeal(id);

  const initialValues: Omit<z.infer<typeof mealFormSchema>, "user"> = useMemo(
    () =>
      meal
        ? {
            name: meal.name,
            meals: meal.meals,
            category: meal.category,
            metadata: meal.metadata,
          }
        : {
            name: "",
            meals: [],
            category: "breakfast" as const,
            metadata: {
              energy: { value: 0, unit: "kcal" as const },
              fats: {
                value: 0,
                unit: "g" as const,
              },
              proteins: {
                value: 0,
                unit: "g" as const,
              },
              carbohydrates: {
                value: 0,
                unit: "g" as const,
              },
            },
          },
    [meal],
  );

  return (
    <Formik
      validate={withZodSchema(mealFormSchema)}
      initialValues={initialValues}
      onSubmit={async (value, { resetForm }) => {
        if (action === "edit" && id)
          await trpc.log.meal.update
            .mutate({
              id,
              ...value,
              meals: value.meals.map((meal) => meal.id),
            })
            .then((data) =>
              dispatch(logActions.updateMealLog({ id, changes: data })),
            );

        await trpc.log.meal.create
          .mutate({
            ...value,
            meals: value.meals.map((meal) => meal.id),
          })
          .then((data) => dispatch(logActions.addMealLog(data)));

        router.dismissAll();
        resetForm();
      }}
    >
      <Stack
        screenOptions={({ navigation }) => ({
          headerTitleAlign: "center",
          presentation: "fullScreenModal",
          animation: "slide_from_right",
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: "Poppins_500SemiBold",
          },
          headerLeft: () => <BackButton navigation={navigation} />,
          headerStyle: { backgroundColor: "transparent" },
        })}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Meal Log" }}
        />
      </Stack>
    </Formik>
  );
}
