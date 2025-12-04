import { v4 } from "uuid";
import { string, object } from "yup";
import { useFormik } from "formik";
import { useCallback, useEffect, useRef } from "react";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../../constants";
import Message from "../../components/message";
import { useTRPC } from "../../providers/TRPCProvider";
import { useAppDispatch, useAppSelector } from "../../store";
import LoadingIndicator from "../../components/LoadingIndicator";
import { messageActions, messageSelectors } from "../../store/message";

export default function AIScreen() {
  const trpc = useTRPC();
  const listRef = useRef<FlatList>(null);
  const { data, refetch, isRefetching, isFetching } = useQuery(
    trpc.message.list.queryOptions(),
  );

  const dispatch = useAppDispatch();
  const messageState = useAppSelector((state) => state.message);
  const messages = messageSelectors.selectAll(messageState);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const { isPending, mutateAsync } = useMutation(
    trpc.message.create.mutationOptions({
      onSuccess(data) {
        dispatch(messageActions.upsertMessages(data));
      },
    }),
  );

  const sendMessage = useCallback(
    async (values: { content: string }, resetForm?: () => void) => {
      const message = {
        id: v4(),
        reply: null,
        role: "user" as const,
        createdAt: new Date(),
        content: {
          type: "text" as const,
          data: values.content,
        },
      };

      dispatch(messageActions.addMessage(message));
      resetForm?.();
      return mutateAsync({ ...message, content: values.content })
        .then((messages) => dispatch(messageActions.upsertMessages(messages)))
        .finally(() => scrollToBottom());
    },
    [mutateAsync, dispatch, scrollToBottom],
  );

  const {
    isValid,
    isSubmitting,
    values,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useFormik({
    validateOnMount: true,
    validationSchema: object({ content: string().trim().min(1).required() }),
    initialValues: {
      content: "",
    },
    async onSubmit(values, { resetForm }) {
      return sendMessage(values, resetForm);
    },
  });

  useEffect(() => {
    if (data) {
      dispatch(messageActions.setMessages(data));
      scrollToBottom();
    }
  }, [data, dispatch, scrollToBottom]);

  return (
    <KeyboardStickyView className="flex-1 p-4 px-6">
      <FlatList
        ref={listRef}
        data={messages}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
          paddingVertical: 16,
        }}
        ListEmptyComponent={() => {
          if (isFetching)
            return (
              <ActivityIndicator
                color="white"
                className="m-auto"
              />
            );
          return (
            <EmptyState onMessage={(content) => sendMessage({ content })} />
          );
        }}
        scrollEnabled
        renderItem={({ item, index }) => {
          const previousMessage = messages[index - 1];
          const isSameUser = previousMessage?.role === item.role;

          return (
            <View style={{ marginTop: isSameUser ? 2 : 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: item.system ? "flex-start" : "flex-end",
                }}
              >
                <View
                  style={{
                    maxWidth: "60%",
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: item.system
                      ? Colors.background[8]
                      : Colors.primary,
                  }}
                >
                  <Message message={item} />
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={() => isPending && <LoadingIndicator />}
      />
      <View
        className="flex-row items-center px-4 rounded-md"
        style={{ backgroundColor: Colors.background[8] }}
      >
        <TextInput
          multiline
          value={values.content}
          autoCorrect={false}
          placeholder="Ask anything"
          placeholderTextColor="white"
          cursorColor={Colors.primary}
          selectionColor={Colors.primary}
          selectionHandleColor={Colors.primary}
          underlineColorAndroid="transparent"
          className="flex-1 text-white py-4 font-poppins"
          onBlur={handleBlur("content")}
          onChangeText={handleChange("content")}
        />
        <Pressable
          disabled={isSubmitting}
          onPress={() => handleSubmit()}
        >
          <PaperPlaneTiltIcon color={isValid ? Colors.primary : Colors.grey} />
        </Pressable>
      </View>
    </KeyboardStickyView>
  );
}

type EmptyStateProps = {
  onMessage: (message: string) => void;
};
const EmptyState = ({ onMessage }: EmptyStateProps) => {
  const questions = [
    "What can you do?",
    "What is my calories count for this week",
  ];
  return (
    <View className="flex-1  items-center justify-center gap-y-6">
      <Text className="text-white text-2xl font-poppins-semibold">
        What can I do for you?
      </Text>
      <View className="flex-row gap-x-4">
        {questions.map((question, index) => (
          <Pressable
            key={index}
            className="flex-1 px-4 py-3 rounded-xl"
            style={{ backgroundColor: Colors.background[9] }}
            onPress={() => onMessage(question)}
          >
            <Text
              className="text-white font-poppins"
              numberOfLines={1}
            >
              {question}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
