require("dotenv").config();
const { execSync } = require("child_process");

const interpreter = execSync("which bun").toString().trim();

module.exports = {
  apps: [
    {
      interpreter,
      name: "motus",
      instances: 1,
      exec_mode: "fork",
      script: "server/src/index.ts",
    },
  ],
};
