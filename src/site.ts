// Single source of truth for external URLs and contact methods.
// Every component imports from here so the marketing copy stays
// internally consistent and any change is a one-line edit.

export const site = {
  // Source + docs
  repo:       "https://github.com/vikasswaminh/meshwg",
  deployDocs: "https://github.com/vikasswaminh/meshwg/tree/master/deploy",
  issues:     "https://github.com/vikasswaminh/meshwg/issues",
  license:    "https://github.com/vikasswaminh/meshwg/blob/master/LICENSE",

  // CTAs.
  //   * signupFree → currently points to the self-host docs because the
  //     free version is genuinely self-hosted and works today. Swap to
  //     a hosted /signup URL when the SaaS backend is live; nothing else
  //     in the site has to change.
  //   * proContact → mailto for Pro / managed inquiries. Update the
  //     address before launch.
  signupFree: "https://github.com/vikasswaminh/meshwg#quick-start",
  proContact: "mailto:hello@meshwg.io?subject=MeshWG%20Pro",

  // Brand
  productName: "MeshWG",
  tagline:     "Mesh the routers, laptops, and servers you already own.",
} as const;
