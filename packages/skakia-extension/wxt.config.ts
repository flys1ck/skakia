import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  // WXT defaults Firefox and Safari to MV2.
  manifestVersion: 3,
  imports: false,
  manifest: ({ browser }) => ({
    name: "Skakia",
    description: "Open finished Lichess and Chess.com games in the Skakia desktop app",
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "extension@skakia.app",
          // First release where desktop and Android both understand data_collection_permissions, which AMO requires.
          strict_min_version: "142.0",
          data_collection_permissions: { required: ["none"] },
        },
      },
    }),
  }),
});
