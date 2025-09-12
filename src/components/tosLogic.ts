import { devConsole } from "./utils/devConsole";
const DAY: number = 864e5;
const WEEK: number = 6048e5;

devConsole("%c" + "[DEV: TosLogic] TOS logic loaded", "color: pink; font-style: italic;");

export function isTOSAccepted(): boolean {
    const isRead = localStorage.getItem("potto.dev-LSLOGIC.TAA");
    const isDev = import.meta.env.DEV;
    if (isDev) {
        localStorage.removeItem("potto.dev-LSLOGIC.TAA");
        return confirm("skip tos?");
    }
    if (!isRead) return false;

    const [timestamp, durationStr] = isRead.split("_d");
    const duration = parseInt(durationStr, 10);
    const savedTime = new Date(timestamp).getTime();
    const passCondition = Date.now() - savedTime <= duration;

    if (isNaN(duration)) return false;
    return passCondition;
}

export function acceptTOS(assignedDuration: "day" | "week"): void {
    const durations = {
        day: DAY,
        week: WEEK,
    };
    localStorage.setItem("potto.dev-LSLOGIC.TAA", new Date().toISOString() + "_d" + durations[assignedDuration]);
}

// // Helper function to replace jQuery's fadeOut
// function fadeOut(element: HTMLElement | null, speed: string = "slow"): void {
//     if (!element) return;

//     const duration = speed === "fast" ? 200 : 400;
//     element.style.transition = `opacity ${duration}ms`;
//     element.style.opacity = "0";

//     setTimeout(() => {
//         element.style.display = "none";
//     }, duration);
// }