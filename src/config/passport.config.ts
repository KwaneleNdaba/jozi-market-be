import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Container } from "typedi";
import { AUTH_SERVICE_TOKEN } from "@/interfaces/auth/IAuthService.interface";
import {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_REDIRECT_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "./index";

export const configurePassport = () => {
  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
        callbackURL: GOOGLE_REDIRECT_URI!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Construct display name from profile
          let displayName = profile.displayName || "";
          if (!displayName && profile.name) {
            const parts = [];
            if (profile.name.givenName) parts.push(profile.name.givenName);
            if (profile.name.familyName) parts.push(profile.name.familyName);
            displayName = parts.join(" ") || "";
          }

          // Transform Google profile to our format
          const googleProfile = {
            id: profile.id,
            emails: profile.emails || [],
            displayName: displayName,
            photos: profile.photos || [],
          };

          // Return profile to be handled by callback route
          return done(null, googleProfile);
        } catch (error: any) {
          return done(error, null);
        }
      }
    )
  );

  // Configure Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID!,
        clientSecret: FACEBOOK_APP_SECRET!,
        callbackURL: FACEBOOK_REDIRECT_URI!,
        profileFields: ["id", "emails", "name", "picture.type(large)"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Construct display name from profile
          let displayName = profile.displayName || "";
          if (!displayName && profile.name) {
            const parts = [];
            if (profile.name.givenName) parts.push(profile.name.givenName);
            if (profile.name.familyName) parts.push(profile.name.familyName);
            displayName = parts.join(" ") || "";
          }

          // Transform Facebook profile to our format
          const facebookProfile = {
            id: profile.id,
            emails: profile.emails || [],
            displayName: displayName,
            photos: profile.photos || [],
          };

          // Return profile to be handled by callback route
          return done(null, facebookProfile);
        } catch (error: any) {
          return done(error, null);
        }
      }
    )
  );

  // Note: We're using JWT tokens, not sessions, so no need for serialize/deserialize
};
