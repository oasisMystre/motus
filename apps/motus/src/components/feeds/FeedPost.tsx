import ms from "ms";
import type z from "zod";
import moment from "moment";
import { format } from "util";
import { Image } from "expo-image";
import debounce from "lodash.debounce";
import { Link, router } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { postExtendedSelectSchema, userSelectSchema } from "@motus/server";
import Carousel, {
  type ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";

import Avatar from "../Avatar";
import Button from "../Button";
import { Colors } from "../../constants";
import { CommentItem } from "./CommentItem";
import useDimensions from "../../hooks/useDimensions";
import { useTRPC } from "../../providers/TRPCProvider";
import { useTanstackStore } from "../../hooks/useTanstackStore";

type FeedPostProps = {
  user: z.infer<typeof userSelectSchema>;
  post: z.infer<typeof postExtendedSelectSchema>;
};

export function FeedPost({ post, user }: FeedPostProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { width } = useDimensions("window");
  const slideProgress = useSharedValue(0);
  const slideRef = useRef<ICarouselInstance>(null);

  const canFollow = useMemo(() => post.user.id !== user.id, [post.user, user]);

  const details = useMemo(
    () => [
      { name: "Time", value: ms(post.routineLog!.metadata.duration) },
      {
        name: "Volume",
        value: format(
          "%d%s",
          ...Object.values(post.routineLog!.metadata.volume),
        ),
      },
    ],
    [post],
  );

  const { update } = useTanstackStore(
    queryClient,
    trpc.post.list.queryKey(),
    (post) => post.id,
  );
  const { isPending, ...postLike } = useMutation(
    trpc.post.like.mutationOptions(),
  );
  const { isPending: isPendingFollowing, ...followUser } = useMutation(
    trpc.follow.create.mutationOptions({
      onSuccess(data) {
        update({
          ...post,
          isFollowing: data.isFollowing,
        });
      },
    }),
  );

  const mutatePostLike = useMemo(
    () => debounce(postLike.mutateAsync, 500),
    [postLike.mutateAsync],
  );

  const togglePostLike = useCallback(async () => {
    const liked = !post.liked;
    const changes = {
      liked,
      post: post.id,
      likeCount: liked ? post.likeCount + 1 : post.likeCount - 1,
    };
    update({ ...post, ...changes });
    return mutatePostLike(changes);
  }, [post, update, mutatePostLike]);

  const onPressPagination = (index: number) => {
    slideRef.current?.scrollTo({
      animated: true,
      count: index - slideProgress.value,
    });
  };

  return (
    <View className="gap-y-2">
      <View className="flex-row items-center gap-x-4 px-6">
        <Link href={`/(home)/${post.user.id}`}>
          <Avatar
            url={post.user.profile.avatar}
            style={{ width: 40, height: 40 }}
          />
        </Link>
        <View className="flex-1">
          <Text
            className="!font-poppins-medium"
            style={style.text}
          >
            {post.user.name}
          </Text>
          <Text
            className="text-sm"
            style={style.subtitle}
          >
            {moment(post.createdAt).fromNow()}
          </Text>
        </View>
        {canFollow && (
          <Button
            text={post.isFollowing ? "Unfollow" : "Follow"}
            submitting={isPendingFollowing}
            style={{
              paddingVertical: 4,
              backgroundColor: post.isFollowing ? Colors.grey : Colors.primary,
            }}
            onPress={() =>
              followUser.mutateAsync({
                following: post.user.id,
                isFollowing: !post.isFollowing,
              })
            }
          />
        )}
      </View>
      <View className="gap-y-4">
        <View className="gap-y-4 px-6">
          {post.description && (
            <Text style={style.text}>{post.description}</Text>
          )}
          <View className="flex-row gap-x-4">
            {details.map((detail, index) => (
              <View key={index}>
                <Text style={style.subtitle}>{detail.name}</Text>
                <Text
                  style={style.text}
                  className="text-lg"
                >
                  {detail.value}
                </Text>
              </View>
            ))}
          </View>
          {post.routine && (
            <View className="flex-row flex-wrap gap-2">
              {post.routine.metadata.exercises.map((exercise) => (
                <View
                  key={exercise.id}
                  className="flex-row items-center bg-stone-900 px-2 rounded-md"
                >
                  <Text className="text-white text-lg font-poppins">
                    {exercise.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        {post.images && post.images.length > 0 && (
          <View className="relative">
            <Carousel
              ref={slideRef}
              data={post.images}
              width={Math.max(width, 400)}
              height={Math.max(width, 400)}
              loop={false}
              onProgressChange={slideProgress}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  contentFit="contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            />
            {post.images.length > 1 && (
              <Pagination.Basic
                data={post.images}
                progress={slideProgress}
                onPress={onPressPagination}
                containerStyle={{ columnGap: 4 }}
                dotStyle={{ backgroundColor: Colors.grey, borderRadius: 50 }}
                activeDotStyle={{ backgroundColor: Colors.primary }}
              />
            )}
          </View>
        )}
        <View className="gap-y-2 px-6">
          <View className="flex-row items-center gap-x-4">
            <Pressable
              className="flex-row items-center gap-x-1"
              onPress={togglePostLike}
            >
              <Ionicons
                size={24}
                name={post.liked ? "heart" : "heart-outline"}
                color={post.liked ? Colors.red[3] : "white"}
              />
              <Text
                className="text-white font-poppins"
                style={{ color: Colors.grey }}
              >
                {post.likeCount}
              </Text>
            </Pressable>
            <Pressable
              className="flex-row items-center gap-x-2"
              onPress={() =>
                router.push(format("/(comments)/%s", post.id) as "/(comments)/")
              }
            >
              <MaterialCommunityIcons
                size={24}
                name="comment-outline"
                color="white"
              />
              <Text
                className="text-white font-poppins"
                style={{ color: Colors.grey }}
              >
                {post.commentCount}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-x-2">
              <MaterialCommunityIcons
                size={24}
                name="share-outline"
                color="white"
              />
            </View>
          </View>
          <View className="flex flex-row items-center gap-x-2">
            <View className="flex-row">
              {post.peekLikes.map((like, index) => (
                <Avatar
                  key={index}
                  size={16}
                  url={like.user.profile.avatar}
                  style={{ width: 32, height: 32, marginLeft: index * -16 }}
                />
              ))}
            </View>
            {post.peekLikes.length > 0 && (
              <Text
                className="font-poppins"
                style={{ color: Colors.grey }}
              >
                Liked by {post.peekLikes[0].user.name}&nbsp;
                {post.peekLikes.length > 1 && "and others"}
              </Text>
            )}
          </View>
          <View className="gap-y-2">
            {post.peekComments.map((comment, index) => (
              <CommentItem
                key={index}
                comment={comment}
                avatarAttrs={{
                  style: { width: 28, height: 28 },
                }}
              />
            ))}
            <Link href={format("/(comments)/%s", post.id) as "/(comments)"}>
              <View className="flex-row items-center gap-x-2">
                <Avatar
                  url={user.profile.avatar}
                  size={24}
                  style={{ width: 40, height: 40 }}
                />
                <Text
                  className="font-poppins"
                  style={{ color: Colors.grey }}
                >
                  Add a comment...
                </Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  text: {
    color: "white",
    fontFamily: "Poppins_400Regular",
  },
  subtitle: {
    color: Colors.grey,
    fontFamily: "Poppins_400Regular",
  },
});
