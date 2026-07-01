import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VibeBasket",
    short_name: "VibeBasket",
    description:
      "Bundle trusted MCP servers, skills, and rules into one shareable install flow for AI IDEs and CLI tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1512",
    theme_color: "#0f1512",
    categories: ["developer", "productivity", "utilities"],
    lang: "en",
  };
}
