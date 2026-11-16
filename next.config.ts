import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Googlebot can mistake streamed metadata's internal icon keys for URLs.
  // Keep metadata in the initial HTML for Googlebot and the default bot list.
  htmlLimitedBots: /(?:^|[^\w-])[\w-]+-Google|Google-[\w-]+|Googlebot|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|meta-externalagent|meta-externalfetcher|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
};

export default nextConfig;
