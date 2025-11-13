import type z from "zod";
import Color from "color";
import moment from "moment";
import { format } from "util";
import "moment-duration-format";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { DotsThreeIcon } from "phosphor-react-native";
import type { workoutLogSelectSchema } from "@motus/server";
import {
  View,
  Text,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { Colors } from "../../../../../constants";
import Button from "../../../../../components/Button";
import DumbBell from "../../../../../assets/dumb-bell";
import { useTRPC } from "../../../../../providers/TRPCProvider";
import SearchInput from "../../../../../components/SearchInput";
import KeyboardView from "../../../../../components/KeyboardView";
import { useAppDispatch, useAppSelector } from "../../../../../store";
import { logActions, workoutLogSelector } from "../../../../../store/log";
import { WorkoutLogItemMenu } from "../../../../../components/create-workout/WorkoutLogItemMenu";

export default function LogoutWorkoutScreen() {
  const trpc = useTRPC();
  const navigation = useNavigation();
  const [search, setSearch] = useState<string>();
  const [workout, setWorkout] = useState<z.infer<
    typeof workoutLogSelectSchema
  > | null>(null);

  const dispatch = useAppDispatch();
  const { workout: workoutState } = useAppSelector((state) => state.log);
  const workouts = workoutLogSelector.selectAll(workoutState);

  const { data, isPending, isRefetching, refetch } = useQuery(
    trpc.log.workout.list.queryOptions({ search }),
  );

  useEffect(() => {
    if (data) dispatch(logActions.setWorkouts(data));
  }, [data]);

  useEffect(() => {
    if (workouts.length > 0) {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            className="p-2"
            onPress={() => router.push("/log-workout")}
          >
            <Text className="text-primary font-poppins">Log Workout</Text>
          </Pressable>
        ),
      });
      return () => navigation.setOptions({ headerRight: undefined });
    }
  }, [workouts, navigation]);

  return (
    <>
      <KeyboardView>
        <View className="flex-1">
          <SearchInput
            inputAttrs={{
              value: search,
              placeholder: "Search workouts log",
              onChangeText: setSearch,
            }}
          />
          <FlatList
            data={workouts}
            style={{ flex: 1, paddingTop: 32 }}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                onRefresh={refetch}
                refreshing={isRefetching}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
                progressBackgroundColor="white"
              />
            }
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={() =>
              isPending ? (
                <ActivityIndicator
                  color="white"
                  className="flex-1"
                />
              ) : (
                <View className="items-center justify-center gap-y-8 mt-16">
                  <View className="items-center justify-center gap-y-4">
                    <DumbBell />
                    <View className="items-center justify-center">
                      <Text className="text-lg text-white font-poppins-medium">
                        Workout
                      </Text>
                      <Text
                        className="font-poppins"
                        style={{ color: Colors.grey }}
                      >
                        No workout log created yet
                      </Text>
                    </View>
                  </View>
                  <Button
                    text="Create Workout"
                    style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                    onPress={() => router.push("/log-workout")}
                  />
                </View>
              )
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View
                className="flex-row gap-x-4 py-2 px-4 rounded-xl"
                style={{ backgroundColor: Color("white").alpha(0.1).hexa() }}
              >
                <View className="flex-1  justify-center">
                  <Text className="text-white font-poppins">{item.name}</Text>
                  <Text
                    className="text-sm font-poppins"
                    style={{ color: Colors.grey }}
                  >
                    {format(
                      "Sets %d, Reps %s, Weight per set %dkg",
                      item.metadata.sets,
                      item.metadata.reps,
                      item.metadata.weight,
                    )}
                  </Text>
                </View>
                <View className="items-end">
                  <Pressable onPress={() => setWorkout(item)}>
                    <DotsThreeIcon color="white" />
                  </Pressable>
                  <Text className="text-lg text-white font-poppins-medium">
                    {moment.duration(item.metadata.duration).format("m:ss")}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </KeyboardView>
      {workout && (
        <WorkoutLogItemMenu
          workout={workout}
          onClose={() => setWorkout(null)}
        />
      )}
    </>
  );
}
