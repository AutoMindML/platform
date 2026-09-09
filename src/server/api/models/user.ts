import { z } from "zod";

// create object type from zod schema:
// z.infer<typeof ...>
// issue: https://github.com/colinhacks/zod/issues/62#issuecomment-694513455

interface CreateUserProps {
  name: string;
  email: string;
  emailVerified: string;
  image: string;
}

const UserZodSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

const AccountZodSchema = z.record(z.unknown()).and(
  z.object({
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    id_token: z.string().optional(),
    refresh_token: z.string().optional(),
    scope: z.string().optional(),
    expires_at: z.number().optional(),
    session_state: z.string().optional(),
    providerAccountId: z.string(),
    userId: z.string().optional(),
    provider: z.string(),
    type: z.union([
      z.literal("oauth"),
      z.literal("email"),
      z.literal("credentials"),
    ]),
  }),
);

const SettingZodSchema = z.object({
  darkMode: z.boolean(),
});

type SettingSchema = z.infer<typeof SettingZodSchema>;

const defaultSetting: SettingSchema = {
  darkMode: false,
};

export {
  AccountZodSchema,
  type CreateUserProps,
  defaultSetting,
  SettingZodSchema,
  UserZodSchema,
};
