/* The page script: the concept's plain scripts, in order, as one file. They share globals ($, NOTES, ROUTE, AR…)
   the way separate <script> tags would, so they are joined rather than bundled as modules. */
import { createHash } from "node:crypto";
import route from "../site/route.js?raw";
import sky from "../site/sky.js?raw";
import common from "../site/common.js?raw";
import visitor from "../site/visitor.js?raw";
import welcome1 from "../site/welcome1.js?raw";
import welcome2 from "../site/welcome2.js?raw";
import welcome3 from "../site/welcome3.js?raw";
import work from "../site/work.js?raw";
import home from "../site/home.js?raw";
import ar from "../site/ar.js?raw";

// start: the Arabic layer, then the page the address names, then show it
const done = `AR.init();\nif (window.BOOTROUTE) BOOTROUTE();\nROUTE.sync();\ndocument.documentElement.classList.remove("boot");\n`;
export const code = [route, sky, common, visitor, welcome1, welcome2, welcome3, work, home, ar, done].join("\n;\n");
export const file = "site-" + createHash("sha256").update(code).digest("hex").slice(0, 10);
