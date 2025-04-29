export interface FormQuestion {
    id: string;
    label: string;
    description: string;
    type: "text" | "select" | "singleChoice" | "checkbox";
    options?: {
        optionName: string;
        optionDescription: string;
        optionPrice: number;
    }[];
    placeholder?: string; // for text
    required?: boolean;
}
export interface CardData {
    title: string;
    description: string;
    images: {
        src: string;
        alt?: string;
        pos?: string;
        style?: string; //lazy fuck solution
    }[];
    price: number;
    tags: string[];
    isDisabled?: boolean;
    configData?: FormQuestion[];
    //form questions
    //includes fomr types: single choices, two options, and text input
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
        price: 10,
        tags: [
            "Fixed shading",
            "Stackable",
            "Simple backgrounds",
            "Pony",
            "Semi-anthro",
            "Anthro"
        ],
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
        price: 15,
        tags: [
            "Configurable shading",
            "Simple Backgrounds",
            "Allows multi-version",
            "Pony",
            "Semi-Anthro",
            "Anthro"
        ],
    },
    fullbody: {
        title: "Fullbody",
        description: "Display the full body of your character(s) of choice.",
        images: [
            { src: "/imgs/showcase/fullbod1.jpg" },
            { src: "/imgs/showcase/fullbod2.jpg" },
            { src: "/imgs/showcase/fullbod3.jpg" },
            { src: "/imgs/showcase/fullbod4.jpg", pos: "top" },
        ],
        price: 25,
        tags: [
            "Configurable Shading",
            "Full backgrounds",
            "Configurable backgrounds",
            "Allows multi-version",
            "Pony",
            "Semi-Anthro",
            "Anthro"
        ],
        isDisabled: false,
        configData: [
            {
                id: "shading",
                label: "Shading style",
                description: "Choose between flat or full shading.",
                type: "singleChoice",
                options: [
                    { optionName: "Sketch", optionDescription: "Loose and rougher look", optionPrice: 25 },
                    { optionName: "Linart", optionDescription: "Cleaner lines", optionPrice: 30 },
                    { optionName: "Flat Color", optionDescription: "Cleaner lines & Light render", optionPrice: 45 },
                    { optionName: "Fully Rendered", optionDescription: "Best render and visual", optionPrice: 60 },
                ],
                required: true,
            },
            {
                id: "background",
                label: "Background type",
                description: "Choose between a simple or complex background.",
                type: "select",
                options: [
                        
                        { optionName: "Simple", optionDescription: "Solid, gradient, or even with quirky particles", optionPrice: 0 },
                        { optionName: "Basic", optionDescription: "Basic details, simplified", optionPrice: 35 },
                        { optionName: "Complex", optionDescription: "Complex background", optionPrice: 50 },
                ],
            },
            {
                id: "fish",
                label: "Fish",
                description: "fish",
                type: "text",
                placeholder: "fish",
            },
            {
                id: "fish2",
                label: "Fish",
                description: "fish",
                type: "text",
                placeholder: "fish",
            }
        ],
    },
};