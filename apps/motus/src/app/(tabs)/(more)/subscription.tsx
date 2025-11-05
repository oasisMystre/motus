import moment from "moment";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "../../../constants";

type Plan = {
  name: string;
  description: string;
  price: {
    currency: "USD";
    amount: number;
  };
  duration: number;
  perks: [
    {
      icon: Icon;
      name: string;
    },
    {
      icon: Icon;
      name: string;
    },
    {
      icon: Icon;
      name: string;
    },
  ];
};

import {
  BarbellIcon,
  GiftIcon,
  type Icon,
  RobotIcon,
} from "phosphor-react-native";
import Button from "../../../components/Button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SubscriptionScreen() {
  const [currentPlan] = useState("Free");
  const { bottom } = useSafeAreaInsets();

  const subscriptions: Plan[] = useMemo(
    () => [
      {
        name: "Free",
        description:
          "Simplify your journey with faster logging tools and custom settings",
        price: {
          currency: "USD",
          amount: 0,
        },
        duration: moment.duration({ month: 1 }).milliseconds(),
        perks: [
          {
            icon: GiftIcon,
            name: "Regular rewards",
          },
          {
            icon: RobotIcon,
            name: "20 ai queries a day. 2 meal scans, 18 chat bot queries. Initial workout plan creation and meal plan creation does not count towards the 20.",
          },
          {
            icon: BarbellIcon,
            name: "5 custom exercises creation",
          },
        ],
      },
      {
        name: "Premium",
        description:
          "Simplify your journey with faster logging tools and custom settings",
        price: {
          currency: "USD",
          amount: 9.99,
        },
        duration: moment.duration({ months: 1 }).months(),
        perks: [
          {
            icon: GiftIcon,
            name: "Double the rewards",
          },
          {
            icon: RobotIcon,
            name: "Unlimited access to the AI and the \n whole app",
          },
          {
            icon: BarbellIcon,
            name: "Unlimited custom exercise creation",
          },
        ],
      },
    ],
    [],
  );

  const [plan, setPlan] = useState<Plan>(subscriptions[0]);
  const isDefaultPlan = useMemo(
    () => plan.name === currentPlan,
    [plan, currentPlan],
  );

  return (
    <ScrollView
      className="flex-1 px-6 pt-8"
      style={{ marginBottom: bottom }}
      contentContainerStyle={{ flex: 1, rowGap: 24 }}
    >
      <View className="flex-1 gap-y-8">
        <LinearGradient
          start={{ x: 0, y: 0 }}
          colors={[Colors.amber[1], Colors.amber[2]]}
          style={{
            height: 158,
            padding: 16,
            borderRadius: 12,
            justifyContent: "center",
          }}
        >
          <Text className="text-4xl font-poppins-bold">{plan.name}</Text>
          <Text className="font-poppins">{plan.description}</Text>
        </LinearGradient>
        <View className="gap-y-16">
          <View className="flex-row gap-x-8">
            {subscriptions.map((subscription, index) => {
              const selected = plan.name === subscription.name;
              const intl = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: subscription.price.currency,
              });

              return (
                <Pressable
                  key={index}
                  className="flex-1 p-4  text-center justify-center rounded-xl"
                  style={[
                    { backgroundColor: Colors.background[9], borderWidth: 2 },
                    selected && { borderColor: Colors.amber[2] },
                  ]}
                  onPress={() => setPlan(subscription)}
                >
                  <Text className="text-sm text-white text-center font-poppins">
                    1 Month
                  </Text>
                  <Text className="text-lg text-white text-center font-mono font-bold">
                    {intl.format(subscription.price.amount)}
                  </Text>
                  <Text className="text-sm text-white text-center font-poppins">
                    {subscription.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View className=" gap-y-4">
            <Text className="text-xl text-white uppercase font-poppins-bold">
              {plan.name} Plan Gives You
            </Text>
            <View className="">
              {plan.perks.map((perk, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-x-4 py-4"
                  style={
                    index < plan.perks.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: Colors.border[1],
                    }
                  }
                >
                  <perk.icon
                    color="white"
                    size={24}
                  />
                  <Text
                    className="text-white font-poppins"
                    style={{ color: Colors.grey }}
                  >
                    {perk.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      <Button
        text={isDefaultPlan ? "Default" : "Subscribe Now"}
        style={{
          backgroundColor: isDefaultPlan ? Colors.grey : Colors.primary,
        }}
      />
    </ScrollView>
  );
}
