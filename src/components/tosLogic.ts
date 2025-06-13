const DAY: number = 864e5;
const WEEK: number = 6048e5;

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
    if (isNaN(duration)) return false;

    const savedTime = new Date(timestamp).getTime();
    return Date.now() - savedTime <= duration;
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