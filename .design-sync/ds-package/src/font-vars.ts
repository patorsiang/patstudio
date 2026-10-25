// next/font/google normally defines --font-geist-sans / --font-geist-mono on
// <html> (see apps/portfolio-web/src/app/fonts.ts). Outside Next nothing does,
// and every component's compiled CSS reads them via var(), so text would fall
// back to Arial. The @font-face rules ship in fonts/fonts.css (cfg.extraFonts);
// this points the variables at those families when the bundle loads.
if (typeof document !== "undefined" && !document.getElementById("ds-font-vars")) {
  const style = document.createElement("style");
  style.id = "ds-font-vars";
  style.textContent = ':root{--font-geist-sans:"Geist";--font-geist-mono:"Geist Mono";}';
  document.head.appendChild(style);
}
export {};
