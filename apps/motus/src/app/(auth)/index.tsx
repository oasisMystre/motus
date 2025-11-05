import color from "color";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "../../constants";
import useDimensions from "../../hooks/useDimensions";
import WalletConnect from "../../assets/wallet-connect";
import RepeatedText from "../../components/RepeatedText";

export default function AuthScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useDimensions("window");

  return (
    <View style={{ flex: 1, width, height }}>
      <LinearGradient
        style={{
          inset: 0,
          padding: 8,
          position: "absolute",
        }}
        colors={["black", color("#B860E7").darken(0.7).hexa(), "black"]}
      >
        <RepeatedText
          width={width}
          height={height}
          textAttrs={{ stroke: color(Colors.gray).alpha(0.5).hexa() }}
          text={["MOTUS", "MOTUS", "MOTUS", "MOTUS", "MOTUS"]}
          style={{
            top,
            zIndex: 1,
            position: "absolute",
          }}
        />
      </LinearGradient>
      <Image
        source={require("../../../assets/images/auth-screen-1.png")}
        style={{
          top,
          left: 0,
          right: 0,
          zIndex: 1,
          width: "100%",
          height: "70%",
          bottom: height / 3,
          objectFit: "contain",
          position: "absolute",
        }}
      />
      <LinearGradient
        style={{
          height,
          gap: 24,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: 16,
          position: "absolute",
          justifyContent: "flex-end",
        }}
        locations={[0, 0.68, 0.6]}
        colors={[
          color("black").alpha(0).hexa(),
          color("black").alpha(1).hexa(),
          color("black").alpha(0.95).hexa(),
        ]}
      >
        <View
          style={{
            rowGap: 32,
            marginBottom: bottom,
          }}
        >
          <View style={{ rowGap: 24 }}>
            <Link
              href="/(auth)/(signup)"
              asChild
            >
              <Pressable style={style.button}>
                <Feather
                  name="mail"
                  size={20}
                  color="white"
                />
                <Text style={{ color: "white" }}>Sign up with Email</Text>
              </Pressable>
            </Link>

            <Pressable
              style={style.button}
              onPress={async () => {}}
            >
              <WalletConnect className="object-cover" />
              <Text style={{ color: "white" }}>Connect Wallet</Text>
            </Pressable>
          </View>
          <View
            style={{
              columnGap: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white" }}>Already have an account?</Text>
            <Link
              href="/(auth)/login"
              style={{ color: Colors.primary }}
            >
              Login
            </Link>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const style = StyleSheet.create({
  button: {
    padding: 16,
    columnGap: 16,
    borderRadius: 8,
    borderWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: Colors.primary,
  },
});
