import z from "zod";
import { v4 } from "uuid";
import { Formik } from "formik";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  mealLogInsertSchema,
  type mealLogSelectSchema,
  mealSelectSchema,
} from "@motus/server";

import { useFirebase } from "../../../../../providers";
import { BackButton } from "../../../../../components/Header";
import { useTanstackStore } from "../../../../../hooks/useTanstackStore";
import { uploadImageFromUri, withZodSchema } from "../../../../../utils";
import { useTRPC, useTRPCClient } from "../../../../../providers/TRPCProvider";

const mealFormSchema = mealLogInsertSchema
  .omit({ user: true, meals: true })
  .extend({
    meals: z.array(mealSelectSchema).min(1),
  });

export default function LogMealLayout() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();
  const {
    firebase: { storage },
  } = useFirebase();
  const { id } = useLocalSearchParams<{
    id?: string;
    action?: "edit" | "duplicate";
  }>();

  const { data: meal } = useQuery({
    enabled: Boolean(id),
    ...trpc.log.meal.retrieve.queryOptions({ id: id! }),
  });
  const { update } = useTanstackStore(
    queryClient,
    trpc.log.meal.list.queryKey({ search: undefined }),
    (meal) => meal.id,
  );

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
            category: "breakfast",
            metadata: {
              energy: { value: 0, unit: "kcal" },
              fats: {
                value: 0,
                unit: "g",
              },
              proteins: {
                value: 0,
                unit: "g",
              },
              carbohydrates: {
                value: 0,
                unit: "g",
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
        value.id = id ?? v4();
        if (value.image)
          value.image = await uploadImageFromUri(storage, value.image, {
            fileName: value.id,
          });
        let response: z.infer<typeof mealLogSelectSchema>;
        if (id)
          response = await trpcClient.log.meal.update.mutate({
            id,
            ...value,
            meals: value.meals.map((meal) => meal.id),
          });
        else
          response = await trpcClient.log.meal.create.mutate({
            ...value,
            meals: value.meals.map((meal) => meal.id),
          });

        update(response);

        resetForm();
        router.dismissAll();
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
