// Single source of truth for external URLs and contact methods.
// Every component imports from here so the marketing copy stays
// internally consistent and any change is a one-line edit.

export const site = {
  // CTAs. Every "Sign up free" and "Sign in" button on the site routes
  // to the app login page. Today the login page also carries a
  // contact-us line under the form; once self-serve signup ships, that
  // line becomes a "Sign up →" link. The marketing site doesn't change.
  signupFree: "https://vpn.meshwg.com/login",
  signIn:     "https://vpn.meshwg.com/login",

  // Pro / sales contact.
  proContact: "mailto:hello@meshwg.com?subject=MeshWG%20Pro",

  // Brand
  productName: "MeshWG",
  domain:      "meshwg.com",
  tagline:     "Mesh the routers, laptops, and servers you already own.",
} as const;
