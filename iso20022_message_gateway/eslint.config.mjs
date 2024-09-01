import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,      
        ...globals.jest,     
        ...globals.browser,  
      },
    },
  },
  pluginJs.configs.recommended,
];
