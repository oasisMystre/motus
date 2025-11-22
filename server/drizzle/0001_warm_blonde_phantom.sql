ALTER TABLE "posts" RENAME COLUMN "log" TO "routineLog";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_uid_email_unique";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_log_routine-logs_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "mealLog" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_mealLog_meal-logs_id_fk" FOREIGN KEY ("mealLog") REFERENCES "public"."meal-logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_routineLog_routine-logs_id_fk" FOREIGN KEY ("routineLog") REFERENCES "public"."routine-logs"("id") ON DELETE cascade ON UPDATE no action;