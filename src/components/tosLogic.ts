const ONE_DAY: number = 864e5;
const TOS_EXPIRY: number = 6048e5;

export function isTOSAccepted(): boolean {
    const t = localStorage.getItem("potto.dev-LSLOGIC.TAA");
    return t ? Date.now() - new Date(t).getTime() <= TOS_EXPIRY : false;
}

export function acceptTOS(): void {
    localStorage.setItem("potto.dev-LSLOGIC.TAA", new Date().toISOString());
}

// Helper function to replace jQuery's fadeOut
function fadeOut(element: HTMLElement | null, speed: string = "slow"): void {
    if (!element) return;

    const duration = speed === "fast" ? 200 : 400;
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = "0";

    setTimeout(() => {
        element.style.display = "none";
    }, duration);
}