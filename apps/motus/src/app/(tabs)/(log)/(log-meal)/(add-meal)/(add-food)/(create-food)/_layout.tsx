import { mealInsertSchema } from "@motus/server";
import { router, Stack } from "expo-router";
import { Formik } from "formik";
import { useMemo } from "react";
import { number, object, string } from "yup";

import { BackButton } from "../../../../../../../components/Header";
import { nutriments } from "../../../../../../../constants/nutriments";
import { useTRPCClient } from "../../../../../../../providers/TRPCProvider";
import { useAppDispatch } from "../../../../../../../store";
import { mealActions } from "../../../../../../../store/meals";

export default function CreateFoodScreen() {
  const trpc = useTRPCClient();
  const dispatch = useAppDispatch();

  const initialValues = useMemo(
    () => ({
      name: undefined,
      brandName: undefined,
      metadata: {
        portionSize: {
          value: undefined,
          unit: "cup",
        },
        nutriments: Object.fromEntries(
          nutriments.map((nutriment) => [
            nutriment.key,
            { value: undefined, unit: nutriment.unit },
          ]),
        ),
      },
    }),
    [],
  );

  const validationSchema = useMemo(
    () =>
      object({
        brandName: string().trim().min(1).optional(),
        name: string().trim().min(1).required(),
        metadata: object({
          portionSize: object({
            value: number().required(),
            unit: string().oneOf(["g", "kg", "litre", "cup"]),
          }),
          nutriments: object(
            Object.fromEntries(
              nutriments.map((nutriment) => {
                let value = number();
                if (nutriment.required) value = value.required();
                return [
                  nutriment.key,
                  object({ value, unit: string().oneOf([nutriment.unit]) }),
                ];
              }),
            ),
          ),
        }),
      }),
    [],
  );

  return (
    <Formik
      validateOnMount
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(value, { resetForm }) =>
        trpc.meal.create
          .mutate(mealInsertSchema.omit({ user: true }).parse(value))
          .then((data) => {
            dispatch(mealActions.addMeal(data));
            return resetForm();
          })
          .then(() => router.dismissTo("/(add-food)/foods"))
      }
    >
      <Stack
        screenOptions={({ navigation }) => ({
          headerTitle: "Create Food",
          headerTitleAlign: "center",
          presentation: "fullScreenModal",
          animation: "slide_from_right",
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: "Poppins_500SemiBold",
          },
          headerLeft: (props) => (
            <BackButton
              {...props}
              navigation={navigation}
            />
          ),
          headerStyle: { backgroundColor: "transparent" },
        })}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="nutriments" />
      </Stack>
    </Formik>
  );
}
