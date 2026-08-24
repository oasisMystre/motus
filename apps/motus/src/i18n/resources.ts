export const resources = {
  en: {
    translation: {
      custom: "Custom",
      onboarding: {
        subtitles: {
          "0": [
            "The first fitness App Improve your fitness,",
            "practice mindfulness, or prepare for new",
            "adventures with a series of specially",
            "designed workouts and meditations.",
          ],
          "1": [
            "Create and save your own custom workouts.",
            "Name your workouts, save them, and they'll",
            "automatically appear when you're ready to",
            "workout",
          ],
          "2": [
            "Every rep counts. Log your workouts",
            "consistently and earn $MOTUS tokens as a reward",
            "for your dedication. Whether you're lifting, running,",
            "or stretching, your effort fuels your progress and",
            "now it earns you crypto too.",
          ],
        },
      },
      auth: {
        next_action: "Next",
        continue_action: "Continue",
        email_input: "Email",
        password_input: "Password",
        signup: {
          title: "Create your account",
          subtitle: "What's your email?",
          password: {
            title: "Create your password",
            subtitle: "Create a password",
            confirm_password: "Confirm Password",
          },
        },
        otp: {
          title: "Create account",
          subtitle: "Please input the code we sent",
          resend_otp_description: "Don't receive an OTP?",
          resend_otp_action: "Resend Now",
          terms_and_condition: [
            "I accept the",
            "terms and condition",
            "and",
            "privacy policies",
            "of motus",
          ],
        },
        login: {
          action: "Login",
          title: "Welcome back",
          subtitle: "Sign in",
          forgotten_password: "Forgotten password?",
          create_account: "Create an account",
        },
        profile: {
          set_name: {
            title: "First, what can we call you",
            subtitle: "We'd like to get to know you",
            input_label: "Preferred first name",
          },
          set_username: {
            title: "Choose a username",
            subtitle: "Which nickname do you want",
            input_label: "Preferred nickname",
          },
          set_age: {
            title: "Tell use a little about yourself",
            input_label: "How old are you?",
          },
          set_gender: {
            title: "Tell us a little bit about yourself",
            subtitle:
              "Please select which sex we should use to calculate your calorie needs",
          },
          set_height: {
            title: "",
            input_label: "How tall are you?",
          },
          more: {
            title: "Just a few more questions",
          },
          set_avatar: {
            title: "Create your avatar",
            skip_action: "Skip",
            upload_action: "Upload Image",
            avatar_list_title: "Choose an avatar",
          },
        },
      },
      log: {
        log_workout: {
          title: "Log Workout",
        },
        log_meal: {
          title: "Log Meal",
          food_title: "My Foods",
          create_food_action: "Create a Food",
          add_food_action_one: "Add {{count}} Food",
          add_food_action_other: "Add {{count}} Foods",
          create_food: {},
        },
        create_goal: {
          title: "Create Goal",
        },
        step: {
          title: "Steps",
        },
        create_workout: {
          title: "Create Workout",
          start_routine_action: "Start Routine",
          create_routine_action: "Create Routine",
          start_empty_workout_action: "Start Empty Workout",
          routine_count: "My Routines ({{count}})",
          exercise_name_input: {
            label: "Exercise name",
            placeholder: "e.g. Bench Pres",
          },
          number_of_set_input: {
            label: "Number of Sets",
          },
          rep_per_set_input: {
            label: "Reps per Set",
          },
          weight_per_set_input: {
            label: "Weight Per Set (kg)",
          },
          time_spent_input: {
            label: "Time Spent",
          },
          note_input: {
            label: "Notes (optional)",
          },
          action: "Save workout",
          add_exercise: {
            exercises: "Exercises",
            custom_exercises: "Custom Exercises",
            all_muscles_action: "All Muscles",
            all_equipments_action: "All Equipments",
            unlock_more_action: "Unlock More",
            add_exercise_action_one: "Add {{count}} Exercise",
            add_exercise_action_other: "Add {{count}} Exercises",
          },
        },
      },
      firebase: {
        error: {
          "auth/invalid-credential": "email or password incorrect. Try again!",
          "auth/weak-password": "Weak password. Try again!",
          "auth/invalid-email": "Invalid email address. Try again!",
          "auth/wrong-password": "Invalid login details.",
          "auth/user-not-found": "User already deleted.",
          "auth/user-disabled": "User disabled. Contact support!",
          "auth/email-already-in-use": "User already exists.",
          "auth/custom-error": "Unexpected error occurred. Try again!",
        },
      },
      notifications: {
        new_follower: "{{ username }} followed you",
        new_post: "{{ username }} just made a new workout post",
        post_new_like: "{{ username }} liked your workout post",
        post_new_comment: "{{ username }} replied to your workout post",
        post_new_comment_like: "{{ username }} liked comment",
        new_mention: "{{ username }} mentioned you",
      },
    },
  },
} as const;
