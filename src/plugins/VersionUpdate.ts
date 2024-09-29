import fs from "fs";
import child_process from "child_process";

const exec = child_process.execSync;

const writeVersion = (
  versionFile: number | fs.PathLike,
  content: string | NodeJS.ArrayBufferView,
) => {
  // 写入文件
  fs.writeFile(versionFile, content, (err) => {
    if (err) throw err;
  });
};

export const VersionUpdate = (options: { version: number; name: string }) => {
  let config: { build: { outDir: fs.PathLike } };

  return {
    name: "version-update",

    configResolved(resolvedConfig: { build: { outDir: fs.PathLike } }) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },

    closeBundle() {
      // commit id
      let commit = "";
      // 分支名称
      let branchname = "";
      // 打包用户
      let username = "";
      // 打包用户
      let useremail = "";

      try {
        commit = exec("git rev-parse --short HEAD")?.toString().trim() || "";
        branchname = exec("git rev-parse --abbrev-ref HEAD")?.toString().trim() || "";
        username = exec("git config --get user.name")?.toString().trim() || "";
        useremail = exec("git config --get user.email")?.toString().trim() || "";
      } catch (e) {
        console.log("e", e);
      }

      const content = JSON.stringify({
        version: options.version,
        branch_name: branchname,
        git_commit: commit,
        git_name: username,
        git_email: useremail,
        package: options.name, // 项目名称
      });

      const file = `${config.build.outDir}/assets/version.json`;

      if (fs.existsSync(`${config.build.outDir}/assets`)) {
        writeVersion(file, content);
      } else {
        fs.mkdir(`${config.build.outDir}/assets`, (err) => {
          if (err) throw err;
          writeVersion(file, content);
        });
      }
    },
  };
};
