export type LoginState = {
  error?: string;
};

export type PostFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type DeletePostResult =
  | { ok: true }
  | { ok: false; error: string };
