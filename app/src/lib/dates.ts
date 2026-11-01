/** Shared by the post page and its per-post OG image, so a date never renders two different ways. */
export const postDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
