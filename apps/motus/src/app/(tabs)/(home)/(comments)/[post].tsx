import { v4 } from "uuid";
import { format } from "util";
import { useFormik } from "formik";
import { object, string } from "yup";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  Pressable,
  TextInput,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../../../../constants";
import { useFirebase } from "../../../../providers";
import { useComment } from "../../../../hooks/useComment";
import { useTRPC } from "../../../../providers/TRPCProvider";
import { useTanstackStore } from "../../../../hooks/useTanstackStore";
import { CommentItem } from "../../../../components/feeds/CommentItem";

export default function PostCommentScreen() {
  const trpc = useTRPC();
  const { user } = useFirebase();
  const queryClient = useQueryClient();
  const { bottom } = useSafeAreaInsets();
  const { post } = useLocalSearchParams<{ post: string }>();

  const { update: updatePost } = useTanstackStore(
    queryClient,
    trpc.post.list.queryKey(),
    (post) => post.id,
  );
  const { comments, addComment, updateComment, isFetching } = useComment(post);

  const { mutate } = useMutation(
    trpc.post.comment.create.mutationOptions({
      onSuccess(data) {
        const commentCount = comments.length + 1;
        updateComment({
          id: data.id,
          changes: { ...data, sent: true, failed: false },
        });
        const posts = queryClient.getQueryData(trpc.post.list.queryKey());
        const postData = posts?.find((item) => item.id === post);
        if (postData)
          updatePost({
            ...postData,
            commentCount,
          });
      },
      onError(_, data) {
        if (data.id)
          updateComment({
            id: data.id,
            changes: { sent: false, failed: true },
          });
      },
    }),
  );

  const {
    isValid,
    values,
    handleSubmit,
    handleBlur,
    handleChange,
    setFieldValue,
  } = useFormik({
    validateOnMount: true,
    validationSchema: object({
      text: string().min(1).required(),
    }),
    initialValues: {
      post,
      text: "",
      parent: null,
    },
    async onSubmit(values, { resetForm }) {
      const id = v4();
      const comment = { id, ...values, tags: [], createdAt: new Date() };
      addComment({
        ...comment,
        user,
        sent: false,
        failed: false,
      });

      mutate(comment);
      resetForm();
    },
  });

  return (
    <View className="flex-1 p-4">
      <FlatList
        data={comments}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        keyExtractor={(comment) => comment.id}
        ListEmptyComponent={() => {
          if (isFetching)
            return (
              <ActivityIndicator
                color="white"
                className="m-auto"
              />
            );

          return (
            <View className="flex-1 flex flex-col gap-y-2 items-center justify-center">
              <MaterialIcons
                name="inbox"
                size={32}
                color="white"
              />
              <View className="flex flex-col items-center justify-center">
                <Text className="text-lg text-white font-poppins-medium">
                  No Comment Found
                </Text>
                <Text className="text-sm text-white text-white/75 font-poppins">
                  New comments will be visible here.
                </Text>
              </View>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            showReply
            replyAttrs={{
              onPress() {
                setFieldValue("parent", item.id);
                setFieldValue("text", format("@%s ", item.user.username));
              },
            }}
          />
        )}
      />
      <KeyboardStickyView
        className="flex-row items-center gap-x-4"
        style={{ marginBottom: bottom }}
      >
        <TextInput
          multiline
          value={values.text}
          placeholderTextColor="white"
          cursorColor={Colors.primary}
          selectionColor={Colors.primary}
          placeholder="Add a comment..."
          className="flex-1 font-poppins p-4 rounded-xl text-white"
          style={{ backgroundColor: Colors.darkGray }}
          onBlur={handleBlur("text")}
          onChangeText={handleChange("text")}
        />
        <Pressable
          disabled={!isValid}
          onPress={() => handleSubmit()}
        >
          <PaperPlaneTiltIcon color={isValid ? Colors.primary : Colors.gray} />
        </Pressable>
      </KeyboardStickyView>
    </View>
  );
}
