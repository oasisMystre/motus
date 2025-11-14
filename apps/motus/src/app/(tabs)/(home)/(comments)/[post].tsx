import { v4 } from "uuid";
import assert from "assert";
import { format } from "util";
import { useFormik } from "formik";
import { object, string } from "yup";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pressable,
  TextInput,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { Colors } from "../../../../constants";
import { useAppSelector } from "../../../../store";
import { useComment } from "../../../../hooks/useComment";
import { useTRPC } from "../../../../providers/TRPCProvider";
import KeyboardView from "../../../../components/KeyboardView";
import { useTanstackStore } from "../../../../hooks/useTanstackStore";
import { CommentItem } from "../../../../components/feeds/CommentItem";

export default function PostCommentScreen() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { bottom } = useSafeAreaInsets();
  const { post } = useLocalSearchParams<{ post: string }>();

  const { user } = useAppSelector((state) => state.auth);

  assert(user && user.type === "firebase");

  const { update: updatePost } = useTanstackStore(
    queryClient,
    trpc.post.list.queryKey(),
    (post) => post.id,
  );
  const { comments, addComment, updateComment, isFetching } = useComment(post);

  const { mutate } = useMutation(
    trpc.post.comment.create.mutationOptions({
      onSuccess(data) {
        updateComment({
          id: data.id,
          changes: { ...data, sent: true, failed: false },
        });
        const posts = queryClient.getQueryData(trpc.post.list.queryKey());
        const postData = posts?.find((item) => item.id === post);
        if (postData)
          updatePost({
            ...postData,
            commentCount: comments.length + 1,
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
    <KeyboardView>
      <View className="flex-1">
        <FlatList
          data={comments}
          style={{ flex: 1, paddingTop: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          keyExtractor={(comment) => comment.id}
          ListEmptyComponent={() => {
            return (
              <View className="flex-1 items-center justify-center">
                {isFetching ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <MaterialIcons
                      name="inbox"
                      size={32}
                      color="white"
                    />
                    <Text className="text-lg text-white font-poppins-medium">
                      No Comment Found
                    </Text>
                    <Text className="text-white text-white/75 font-poppins">
                      New comments will be visible here.
                    </Text>
                  </>
                )}
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
        <View
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
            <PaperPlaneTiltIcon
              color={isValid ? Colors.primary : Colors.gray}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardView>
  );
}
