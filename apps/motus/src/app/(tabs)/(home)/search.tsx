import { useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  FlatList,
  Text,
} from "react-native";

import { Colors } from "../../../constants";
import { BackButton } from "../../../components/Header";
import { useTRPC } from "../../../providers/TRPCProvider";
import SearchInput from "../../../components/SearchInput";
import KeyboardView from "../../../components/KeyboardView";
import { useTanstackStore } from "../../../hooks/useTanstackStore";
import { ListItem } from "../../../components/search/ListItem";

export default function SearchScreen() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const [search, setSearch] = useState<string>();
  const {
    data: users = [],
    refetch,
    isRefetching,
    isFetching,
  } = useQuery(
    trpc.user.search.queryOptions({
      search: search && search.trim().length > 0 ? search : undefined,
    }),
  );

  const { update } = useTanstackStore(
    queryClient,
    trpc.user.search.queryKey({
      search: search && search.trim().length > 0 ? search : undefined,
    }),
    (user) => user.id,
  );

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <View
          className="flex-row px-6 gap-x-8"
          style={{ marginTop: top }}
        >
          <BackButton
            navigation={navigation}
            canGoBack
          />
          <SearchInput
            inputAttrs={{
              style: { paddingVertical: 8 },
              placeholder: "Search on Motus",
              onChangeText: setSearch,
            }}
            style={{
              flex: 1,
              borderRadius: 8,
              borderBottomWidth: 0,
              paddingHorizontal: 8,
              backgroundColor: Colors.darkGray,
            }}
          />
        </View>
      ),
    });
    return () => navigation.setOptions({ header: undefined });
  }, [top, navigation]);

  return (
    <KeyboardView>
      <FlatList
        data={users}
        keyExtractor={(user) => user.id}
        style={{ flex: 1, paddingTop: 16 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={() => {
          return (
            <View className="flex-1 items-center justify-center">
              {isFetching ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons
                    name="person"
                    size={32}
                    color="white"
                  />
                  <Text className="text-lg text-white font-poppins-medium">
                    No User Found
                  </Text>
                  <Text className="text-white text-white/75 font-poppins">
                    Search for a user by name or username.
                  </Text>
                </>
              )}
            </View>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.darkGray }} />
        )}
        renderItem={({ item }) => (
          <ListItem
            item={item}
            updateUser={update}
          />
        )}
      />
    </KeyboardView>
  );
}
