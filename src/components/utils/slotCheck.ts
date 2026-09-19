import { withLoaderAnim } from "../utils/quirkyLoaderAsync";
import { devConsole } from "./devConsole";

import.meta.env.DEV
  ? console.log(
    "%c" + "[DEV: slotCheck] Worker rerouted to local",
    "color: orange; font-weight: bold;"
  )
  : null;

const localUrl = "http://127.0.0.1:8787?rc";
// const onlineUrl = "http://127.0.0.1:8787?rc";
const onlineUrl = "https://pottocomm-collector.pottoart.workers.dev?rc";

//devfunc; fake return of slots for testing
const fakeSlots: DbSlots = {
  isFull: false,
  count: 5,
  max: 5
};

async function fetchWithFallback() {
  const tryFetch = async (url: string) => {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`Slot fetch failed: ${response.status}`);
    return response;
  };

  try {
    if (import.meta.env.DEV) {
      devConsole("%c" + "[DEV] Slot check faked.", "color: red; font-size: 2rem; font-weight: bold;");
      //inject fake
      return new Response(JSON.stringify(fakeSlots), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return await fetch(onlineUrl, { method: "GET" });
    }
  } catch (err) {
    console.log(
      "%c" + "[DEV: slotCheck] Local worker did not respond, using deployed worker",
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

export const dbSlotsPromise = fetchWithFallback()
  .then(async (res) => {
    const data = await res.json();
    if (
      typeof data?.count !== "number" ||
      typeof data?.max !== "number" ||
      typeof data?.isFull !== "boolean"
    ) {
      throw new Error("Invalid slot payload");
    }
    return data as DbSlots;
  })
  .catch(() => ({
    count: 0,
    max: 0,
    isFull: true,
  }));

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