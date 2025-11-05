CREATE TABLE "meals" (
	"id" text PRIMARY KEY NOT NULL,
	"brandName" text,
	"name" text NOT NULL,
	"user" uuid,
	"metadata" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentLikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment" uuid NOT NULL,
	"user" uuid NOT NULL,
	"liked" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "commentLikes_comment_user_unique" UNIQUE NULLS NOT DISTINCT("comment","user")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent" uuid,
	"text" text NOT NULL,
	"user" uuid NOT NULL,
	"post" uuid NOT NULL,
	"tags" uuid[],
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postLikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post" uuid NOT NULL,
	"user" uuid NOT NULL,
	"liked" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "postLikes_post_user_unique" UNIQUE NULLS NOT DISTINCT("post","user")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"log" uuid NOT NULL,
	"images" text[],
	"visibility" text DEFAULT 'everyone' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (

);
--> statement-breakpoint
CREATE TABLE "users" (
	"name" text,
	"email" text,
	"username" text,
	"uid" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{"notifications":{"follow":true,"like":{"post":true,"comment":true},"comment":{"workout":true,"reply":true,"mention":true},"discussion":{"workout":true}}}'::jsonb NOT NULL,
	"profile" jsonb DEFAULT '{"steps":3000}'::jsonb NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "email" UNIQUE NULLS NOT DISTINCT("email"),
	CONSTRAINT "username" UNIQUE NULLS NOT DISTINCT("username"),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_uid_email_unique" UNIQUE NULLS NOT DISTINCT("uid","email")
);
--> statement-breakpoint
CREATE TABLE "rewardType" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"point" integer NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "rewardType_title_unique" UNIQUE("title")
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" serial NOT NULL,
	"user" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rewards_type_user_createdAt_unique" UNIQUE("type","user","createdAt")
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"steps" integer NOT NULL,
	"user" uuid NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"createdAt" date DEFAULT now() NOT NULL,
	CONSTRAINT "streaks_user_createdAt_unique" UNIQUE NULLS NOT DISTINCT("user","createdAt")
);
--> statement-breakpoint
CREATE TABLE "muscles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "muscles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"following" uuid NOT NULL,
	"follower" uuid NOT NULL,
	"isFollowing" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pk" PRIMARY KEY("follower","following")
);
--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"name" text NOT NULL,
	"previous" uuid,
	"metadata" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"note" text,
	"equipment" uuid NOT NULL,
	"primary_muscle_group" uuid NOT NULL,
	"other_muscles" uuid[] NOT NULL,
	"exercise_types" text[] NOT NULL,
	"metadata" jsonb NOT NULL,
	"user" uuid,
	CONSTRAINT "exercises_user_name_unique" UNIQUE NULLS NOT DISTINCT("user","name")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"content" jsonb NOT NULL,
	"reply" uuid,
	"user" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user" uuid NOT NULL,
	"routine" uuid NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "meal-logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"category" text NOT NULL,
	"user" uuid NOT NULL,
	"meals" text[] NOT NULL,
	"metadata" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout-logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user" uuid NOT NULL,
	"metadata" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routine-logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user" uuid NOT NULL,
	"routine" uuid NOT NULL,
	"metadata" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_comment_comments_id_fk" FOREIGN KEY ("comment") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_posts_id_fk" FOREIGN KEY ("post") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comment_parent_fk" FOREIGN KEY ("parent") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_post_posts_id_fk" FOREIGN KEY ("post") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_log_routine-logs_id_fk" FOREIGN KEY ("log") REFERENCES "public"."routine-logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_type_rewardType_id_fk" FOREIGN KEY ("type") REFERENCES "public"."rewardType"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_users_id_fk" FOREIGN KEY ("following") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_users_id_fk" FOREIGN KEY ("follower") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routines" ADD CONSTRAINT "routine_previous_fk" FOREIGN KEY ("previous") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_equipment_equipments_id_fk" FOREIGN KEY ("equipment") REFERENCES "public"."equipments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_primary_muscle_group_muscles_id_fk" FOREIGN KEY ("primary_muscle_group") REFERENCES "public"."muscles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "message_reply_fk" FOREIGN KEY ("reply") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_routine_routines_id_fk" FOREIGN KEY ("routine") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal-logs" ADD CONSTRAINT "meal-logs_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout-logs" ADD CONSTRAINT "workout-logs_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine-logs" ADD CONSTRAINT "routine-logs_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routine-logs" ADD CONSTRAINT "routine-logs_routine_routines_id_fk" FOREIGN KEY ("routine") REFERENCES "public"."routines"("id") ON DELETE cascade ON UPDATE no action;