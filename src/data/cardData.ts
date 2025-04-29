export interface FormQuestion {
    subCategory: string;
    id: string;
    type: "textarea" | "flipflop" | "singleChoice" | "checkbox";
    options?: {
        optionName: string;
        optionDescription: string;
        optionPrice: number;
    }[];
    placeholder?: string; // for text
    questionTitle?: string; // for text
    questionDescription?: string; // for text
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
        description: `Compile a collection of little <span class="b7">sketches</span> of your character(s) into a single canvas.`,
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
                subCategory: "chrDetail",
                type: "singleChoice",
                id: "character-detail",
                options: [
                    { optionName: "Sketch", optionDescription: "Loose and rougher look", optionPrice: 25 },
                    { optionName: "Linart", optionDescription: "Cleaner lines", optionPrice: 30 },
                    { optionName: "Flat Color", optionDescription: "Cleaner lines & Light render", optionPrice: 45 },
                    { optionName: "Fully Rendered", optionDescription: "Best render and visual", optionPrice: 60 },
                ],
                required: true,
            },
            {
                subCategory: "background",
                type: "singleChoice",
                id: "background",
                options: [
                        { optionName: "Simple", optionDescription: "Solid, gradient, or even with quirky particles", optionPrice: 0 },
                        { optionName: "Basic", optionDescription: "Basic details, simplified", optionPrice: 35 },
                        { optionName: "Complex", optionDescription: "Complex background", optionPrice: 50 },
                ],
                required: true,
            },
            {
                subCategory: "nsfw",
                type: "flipflop",
                id: "nsfw",
                options: [
                        { optionName: "No", optionDescription: "Pure as a summer.", optionPrice: 0 },
                        { optionName: "Yes", optionDescription: "NSFW may require extra effort.", optionPrice: 15 },
                ],
            },
            {
                type: "textarea",
                subCategory: "character",
                questionTitle: "Todo",
                questionDescription: "lorem",
                id: "fish",
                placeholder: "fish",
                required: true,
            },
            {
                type: "textarea",
                subCategory: "character",
                questionTitle: "Extra details",
                id: "fish2",
                placeholder: "fish2",
            },
            {
                type: "textarea",
                subCategory: "contact",
                questionTitle: "Give me a way we can chat for us to discuss further!",
                questionDescription: `Most active chats: <span class="b7">Discord</span>, <span class="b7">Twitter</span>. <br>If you have none of these, you could provide an <span class="b7">email address</span> instead.`,
                id: "fish2",
                placeholder: `@yourTag OR your@email.com`,
            }
        ],
    },
};