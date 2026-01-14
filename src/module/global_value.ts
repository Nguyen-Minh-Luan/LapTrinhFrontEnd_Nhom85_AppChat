import { decryptToken } from "./encryption";

export const GLOBAL_VALUE = {
  username: () => {
    return localStorage.getItem("USERNAME");
  },
  relogincode: async () => {
    const decryptedToken = await decryptToken(
      localStorage.getItem("RE_LOGIN_CODE"),
    );

    return decryptedToken;
  },
};
