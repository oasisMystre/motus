import { useEffect, useState } from "react";
import { useNavigation } from "expo-router";

import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  FlatList,
} from "react-native";

import { Colors } from "../../../constants";
import { BackButton } from "../../../components/Header";
import { useTRPC } from "../../../providers/TRPCProvider";
import SearchInput from "../../../components/SearchInput";
import KeyboardView from "../../../components/KeyboardView";
import { useAppDispatch, useAppSelector } from "../../../store";
import { ListItem } from "../../../components/search/ListItem";
import { searchActions, searchUserSelectors } from "../../../store/search";

export default function SearchScreen() {
  const trpc = useTRPC();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const [search, setSearch] = useState<string>();
  const { data, refetch, isRefetching } = useQuery(
    trpc.user.search.queryOptions({
      search: search && search.trim().length > 0 ? search : undefined,
    }),
  );

  const dispatch = useAppDispatch();
  const { users: usersState } = useAppSelector((state) => state.search);
  const users = searchUserSelectors.selectAll(usersState);

  useEffect(() => {
    if (data) dispatch(searchActions.setUsers(data));

    return () => {
      dispatch(searchActions.removeAllUsers());
    };
  }, [data]);

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
  }, [navigation]);

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
        ListEmptyComponent={() => <ActivityIndicator color="white" style={{ flex: 1 }} />}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.darkGray }} />
        )}
        renderItem={({ item }) => <ListItem item={item} />}
      />
    </KeyboardView>
  );
}
