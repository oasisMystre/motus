// @ts-nocheck
import moment from "moment";
import { TRPCError } from "@trpc/server";
import type { Auth, DecodedIdToken } from "firebase-admin/auth";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

import { db } from "../instances";
import { RewardType } from "../types";
import { users } from "../db/schema";
import { createReward } from "../routers/rewards/reward.controller";
import type z from "zod";
import type { userSelectSchema } from "../external";

export class FirebaseAuthentication {
  private constructor() {}

  static ExtractAccessTokenFromHeaders(
    headerName: "authorization" = "authorization",
  ) {
    return async ({ req }: CreateFastifyContextOptions) => {
      const authorization = req.headers[headerName];
      if (authorization) {
        const [, idToken] = authorization.split(/\s/);
        if (idToken) return idToken;
      }

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "authorization required in headers",
      });
    };
  }

  private static async getUser(auth: Auth, decodedUser: DecodedIdToken) {
    const firebaseUser = await auth.getUser(decodedUser.uid);
    const value = {
      uid: decodedUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      disabled: firebaseUser.disabled,
      emailVerified: firebaseUser.emailVerified,
      profile: {
        steps: 3000,
        avatar: firebaseUser.photoURL,
      },
      username: firebaseUser.uid,
    };

    const [user] = await db
      .insert(users)
      .values(value)
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: firebaseUser.email,
          disabled: firebaseUser.disabled,
          emailVerified: firebaseUser.emailVerified,
        },
      })
      .returning()
      .execute();
    const today = moment().startOf("day").toDate();

    if (user) {
      createReward(db, {
        user: user.id,
        createdAt: today,
        type: RewardType.new_user_rewards,
      });

      return user;
    }

    throw new TRPCError({
      code: "NOT_FOUND",
      message: "user not found [auth]",
    });
  }

  private static async authenticateWithIdToken(auth: Auth, idToken: string) {
    return FirebaseAuthentication.getUser(
      auth,
      await auth.verifyIdToken(idToken).catch((error) => {
        return Promise.reject(
          new TRPCError({
            code: "UNAUTHORIZED",
            cause: error.cause,
            message: error.message,
          }),
        );
      }),
    );
  }

  private static async authenticateWithSessionCookie(
    auth: Auth,
    sessionCookie: string,
  ) {
    return FirebaseAuthentication.getUser(
      auth,
      await auth.verifySessionCookie(sessionCookie, true).catch((error) => {
        return Promise.reject(
          new TRPCError({
            code: "UNAUTHORIZED",
            cause: error.cause,
            message: error.message,
          }),
        );
      }),
    );
  }

  static async authenticate(
    auth: Auth,
    options: CreateFastifyContextOptions,
  ): Promise<z.infer<typeof userSelectSchema> & { token?: string }> {
    let sessionCookie = options.req.session.get("firebase.token");
    sessionCookie = sessionCookie
      ? sessionCookie
      : (options.req.headers["x-session-token"] as string | undefined);

    if (sessionCookie) {
      const user = await FirebaseAuthentication.authenticateWithSessionCookie(
        auth,
        sessionCookie,
      ).catch(() => null);
      if (user)
        return {
          ...user,
          token: sessionCookie,
        };
    }

    const idToken =
      await FirebaseAuthentication.ExtractAccessTokenFromHeaders(
        "authorization",
      )(options);
    const user = await FirebaseAuthentication.authenticateWithIdToken(
      auth,
      idToken,
    );
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    options.res.setCookie("firebase.token", sessionCookie, {
      maxAge: expiresIn / 1000,
    });
    options.req.session.set("firebase.token", sessionCookie);

    return { ...user, token: sessionCookie };
  }
}
