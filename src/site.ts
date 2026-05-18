// Single source of truth for external URLs and contact methods.
// Every component imports from here so the marketing copy stays
// internally consistent and any change is a one-line edit.

export const site = {
  // CTAs. "Sign up free" goes to the public self-serve signup form;
  // "Sign in" goes to the password / Google / magic-link login page.
  signupFree: "https://vpn.meshwg.com/signup",
  signIn:     "https://vpn.meshwg.com/login",

  // Pro / sales contact.
  proContact: "mailto:hello@meshwg.com?subject=MeshWG%20Pro",

  // Brand
  productName: "MeshWG",
  domain:      "meshwg.com",
  tagline:     "Mesh the routers, laptops, and servers you already own.",
} as const;
