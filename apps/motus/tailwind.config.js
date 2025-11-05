/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#B860E7",
        },
        secondary: {
          DEFAULT: "#84898F",
          dark: "#25252580",
          darkGrey: "#262626",
          darker: "#373737",
        },

        white: {
          DEFAULT: "#FFFFFF",
        },

        black: {
          DEFAULT: "#000000",
        },
      },
      fontFamily: {
        poppins: ["Poppins_400Regular"],
        "poppins-thin": ["Poppins_100Thin"],
        "poppins-thin-italic": ["Poppins_100Thin_Italic"],
        "poppins-extralight": ["Poppins_200ExtraLight"],
        "poppins-extralight-italic": ["Poppins_200ExtraLight_Italic"],
        "poppins-light": ["Poppins_300Light"],
        "poppins-light-italic": ["Poppins_300Light_Italic"],
        "poppins-regular": ["Poppins_400Regular"],
        "poppins-regular-italic": ["Poppins_400Regular_Italic"],
        "poppins-medium": ["Poppins_500Medium"],
        "poppins-medium-italic": ["Poppins_500Medium_Italic"],
        "poppins-semibold": ["Poppins_600SemiBold"],
        "poppins-semibold-italic": ["Poppins_600SemiBold_Italic"],
        "poppins-bold": ["Poppins_700Bold"],
        "poppins-bold-italic": ["Poppins_700Bold_Italic"],
        "poppins-extrabold": ["Poppins_800ExtraBold"],
        "poppins-extrabold-italic": ["Poppins_800ExtraBold_Italic"],
        "poppins-black": ["Poppins_900Black"],
        "poppins-black-italic": ["Poppins_900Black_Italic"],
      },
    },
  },
  plugins: [],
};
