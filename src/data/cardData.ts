export interface CardData {
    title: string;
    description: string;
    images: { src: string; alt?: string }[];
    price: string;
    tags: string[];
}

export const bodyTypes = ["pony", "semi-anthro", "anthro"];

export const cardList: Record<string, CardData> = {
    sketchbook: {
        title: "Sketch Book",
        description: "Compile a collection of little <span class=\"b7\">sketches</span> of your character(s) into a single canvas.",
        images: [
            { src: "/imgs/showcase/sb1.jpg" },
            { src: "/imgs/showcase/sb2.jpg" },
            { src: "/imgs/showcase/sb3.jpg" },
            { src: "/imgs/showcase/sb4.jpg" }
        ],
        price: "10",
        tags: [
            "Fixed shading",
            "Stackable",
            "Simple backgrounds",
            "Pony",
            "Semi-anthro",
            "Anthro"
        ]
    },
    headshot: {
        title: "Headshot",
        description: "Headshot features the character's face and bust.",
        images: [
            { src: "/imgs/showcase/portrait1.jpg" },
            { src: "/imgs/showcase/portrait2.jpg" },
            { src: "/imgs/showcase/portrait3.jpg" },
            { src: "/imgs/showcase/portrait4.jpg" }
        ],
        price: "15",
        tags: [
            "Configurable shading",
            "Simple Backgrounds",
            "Allows multi-version",
            "Pony",
            "Semi-Anthro",
            "Anthro"
        ]
    },
    fullbody: {
        title: "Fullbody",
        description: "Display the full body of your character(s) of choice.",
        images: [
            { src: "/imgs/showcase/fullbod1.jpg" },
            { src: "/imgs/showcase/fullbod2.jpg" },
            { src: "/imgs/showcase/fullbod3.jpg" },
            { src: "/imgs/showcase/fullbod4.jpg" }
        ],
        price: "25",
        tags: [
            "Configurable Shading",
            "Full backgrounds",
            "Configurable backgrounds",
            "Allows multi-version",
            "Pony",
            "Semi-Anthro",
            "Anthro"
        ]
    },
};