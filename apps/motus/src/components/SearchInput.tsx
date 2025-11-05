import clsx from "clsx";
import debounce from "lodash.debounce";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, View, ActivityIndicator } from "react-native";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

import { Colors } from "../constants";

type SearchInputProps = {
  isSearching?: boolean;
  inputAttrs?: React.ComponentProps<typeof TextInput>;
} & React.ComponentProps<typeof View>;

export default function SearchInput({
  inputAttrs,
  isSearching,
  ...props
}: SearchInputProps) {
  const context = useSearch();
  const [isFocus, setIsFocus] = useState(false);
  const onChangeText = useMemo(
    () =>
      debounce((text: string) => {
        inputAttrs?.onChangeText?.(text);
        context?.setValue(text);
      }, 500),
    [inputAttrs?.onChangeText],
  );

  return (
    <View
      {...props}
      className={clsx("flex-row items-center", props.className)}
      style={[
        { borderBottomWidth: 1 },
        isFocus
          ? { borderColor: Colors.primary }
          : { borderColor: Colors.grey },
        props.style,
      ]}
    >
      <Ionicons
        size={18}
        name="search"
        color={isFocus ? Colors.primary : Colors.grey}
      />
      <TextInput
        selectionColor={Colors.primary}
        placeholderTextColor={Colors.grey}
        {...inputAttrs}
        style={[
          {
            flex: 1,
            color: "white",
            paddingHorizontal: 8,
            paddingVertical: 16,
            fontFamily: "Poppins_400Regular",
          },
          inputAttrs?.style,
        ]}
        onFocus={(event) => {
          inputAttrs?.onFocus?.(event);
          setIsFocus(true);
        }}
        onBlur={(event) => {
          inputAttrs?.onBlur?.(event);
          setIsFocus(false);
        }}
        onChangeText={onChangeText}
      />
      {isSearching && <ActivityIndicator />}
    </View>
  );
}

type SearchContext = {
  value?: string;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const SearchContext = createContext<SearchContext | null>(null);

export const SearchProvider = ({ children }: React.PropsWithChildren) => {
  const [value, setValue] = useState<string>();

  return (
    <SearchContext.Provider value={{ value, setValue }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext) as SearchContext;
