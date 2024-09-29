import { login } from "@/services/common";
import { useUser } from "@/store/user";

function ssoLogin(token: string) {
  const userStore = useUser();
  sessionStorage.setItem("token", token);
  return login().then(async (res) => {
    if (!res.token) {
      return;
    }
    sessionStorage.setItem("token", res.token);
    userStore.setUserInfo(res);
    return res;
  });
}

export default ssoLogin;
