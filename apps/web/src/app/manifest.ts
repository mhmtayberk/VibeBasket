import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VibeBasket",
    short_name: "VibeBasket",
    description:
      "Bundle trusted MCP servers, skills, and rules into one shareable install flow for AI IDEs and CLI tools.",
    start_url: "/en",
    display: "standalone",
    background_color: "#0f1512",
    theme_color: "#0f1512",
    icons: [
      {
        src: "/icon",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["developer", "productivity", "utilities"],
    lang: "en",
  };
}
