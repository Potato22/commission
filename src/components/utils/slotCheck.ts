import { withLoaderAnim } from "../utils/quirkyLoaderAsync";

import.meta.env.DEV
  ? console.log(
    "%c" + "[DEV] Worker rerouted to local",
    "color: orange; font-weight: bold;"
  )
  : null;

const localUrl = "http://127.0.0.1:8787?rc";
const onlineUrl = "https://pottocomm-collector.pottoart.workers.dev?rc";

async function fetchWithFallback() {
  try {
    if (import.meta.env.DEV) {
      const response = await fetch(localUrl, { method: "GET" });
      // logIfSlotsFull();
      if (response.ok) return response;
    }
    return await fetch(onlineUrl, { method: "GET" });
  } catch (err) {
    console.log(
      "%c" + "[DEV] Local worker did not respond, using deployed worker",
      "color: red; font-weight: bold;"
    )
    // logIfSlotsFull();
    return await fetch(onlineUrl, { method: "GET" });
  }
}

export type DbSlots = {
  isFull: boolean;
  count: number;
  max: number;
};

export const dbSlotsPromise = fetchWithFallback().then(res => res.json()) as Promise<DbSlots>;

export function slotCheckLS(command: string, slots?: DbSlots) {

  switch (command) {
    case "write":
      localStorage.setItem("dbSlots", JSON.stringify(slots));
      break;
    case "get":
      //turn back into json
      const storedSlots = localStorage.getItem("dbSlots");
      if (storedSlots) {
        return JSON.parse(storedSlots) as DbSlots;
      } else {
        return null;
      }

    default:
      break;
  }
}

async function logIfSlotsFull() {
  const dbSlots = await dbSlotsPromise;
  if (dbSlots.isFull) {
    console.log(
      "%c" + `[i] Slots are out. (${dbSlots.count}/${dbSlots.max})`,
      "color: cyan; font-size: 2rem; font-weight: bold;"
    );
  }
}