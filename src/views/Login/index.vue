<template>
  <div></div>
</template>
<script setup lang="ts">
import ssoLogin from "@/hooks/useLogin";
import { useOrg } from "@/store/org";
import { axiosGet } from "@/utils/request";

const route = useRoute();
const router = useRouter();
const orgStore = useOrg();

onMounted(() => {
  const { token } = route.query;
  ssoLogin(token as string).then(async (res) => {
    if (res) {
      const orgList = await getManagementTreeData();
      await orgStore.setOrgList(orgList);
      router.push("/");
    } else {
      router.push("/expire");
    }
  });
});

/** 获取管辖机构树数据 */
const getManagementTreeData = () => {
  const url = `${$config.api}/police/user/findPoliceManagementTree`;
  return axiosGet(url)
    .then((res) => {
      return res?.code === 200 ? res.data || [] : [];
    })
    .catch(() => {
      return [];
    });
};
</script>
