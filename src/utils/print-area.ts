/*
 * Prints one part of the page (a report card) on its own.
 *
 * window.print() on its own prints the whole app shell: the content sits inside fixed-height
 * scroll areas (SimpleBar, .app-body) that clip it, beside hidden sidebars that still take up
 * room, so the printout comes out blank or cut off. Instead, a copy of the element is placed
 * at the top of <body> and the print stylesheet (custom-style.scss, "Printing one area") shows
 * only that copy.
 */

const ROOT_ID = "print-root";
const ACTIVE_CLASS = "printing-area";

export function printElement(element: HTMLElement | null | undefined): void {
    if (!element) {
        window.print();
        return;
    }

    document.getElementById(ROOT_ID)?.remove();
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.appendChild(element.cloneNode(true));
    document.body.appendChild(root);
    document.documentElement.classList.add(ACTIVE_CLASS);

    let done = false;
    const cleanup = () => {
        if (done) {
            return;
        }
        done = true;
        window.removeEventListener("afterprint", cleanup);
        document.documentElement.classList.remove(ACTIVE_CLASS);
        root.remove();
    };
    // the copy stays until printing ends; it is hidden on screen, and the next print replaces it
    window.addEventListener("afterprint", cleanup);
    window.print();
}
