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
}
export interface FormQuestion {
    category: string;
    subCategory: string;
    id: string;
    type: "textArea" | "flipflop" | "singleChoice" | "fileUpload" | "infoCard" | "quantityCounter";
    options?: {
        //singleChoice & flipflop
        optionName: string;
        optionDescription: string;
        optionPrice: number;
        basePrice?: boolean;
        preChecked?: boolean;
        visibleIf?: {
            questionId: string;
            value: string | string[];
        }
    }[];
    //textArea & fileUpload
    placeholder?: string;
    questionTitle?: string;
    questionDescription?: string;
    required?: boolean;

    //fileUpload
    maxFiles?: number;

    //quantityCounter
    qMin?: number;
    qMax?: number;
    qVal?: number
    qGroup?: {
        name: string;
        gMax?: number;
    };
    perPrice?: number;
}

// Use the BASE_URL environment variable directly

export const bodyTypes = ["pony", "semi-anthro", "anthro"];

const {BASE_URL} = import.meta.env;

// Helper function for path normalization inside this file
function getImagePath(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_URL}/${cleanPath}`;
    return `${BASE_URL}${cleanPath}`;
}
const drawQuantityGroup = {
    name: "drawQuantity",
    gMax: 5,
};


export const cardList: Record<string, CardData> = {
    sketchbook: {
        title: "Sketch Book",
        description: `Compile a collection of little <span class="b7">sketches</span> of your character(s) into a single canvas.`,
        images: [
            { src: getImagePath(`imgs/showcase/sb1.jpg`) },
            { src: getImagePath(`imgs/showcase/sb2.jpg`) },
            { src: getImagePath(`imgs/showcase/sb3.jpg`) },
            { src: getImagePath(`imgs/showcase/sb4.jpg`) }
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
        isDisabled: false,
        configData: [
            {
                category: "general_configurations",
                type: "quantityCounter",
                subCategory: "persketch",
                questionTitle: "Sketches",
                questionDescription: "Amount of sketches",
                id: "sketch_quantity",

                qVal: 1,
                qMax: 5,
                qMin: 0,
                perPrice: 10,
                qGroup: drawQuantityGroup,
            },
            {
                category: "general_configurations",
                type: "quantityCounter",
                subCategory: "percolor",
                questionTitle: "Colored's",
                questionDescription: "Amount of colored doodles",
                id: "color_quantity",

                qVal: 0,
                qMax: 5,
                qMin: 0,
                perPrice: 15,
                qGroup: drawQuantityGroup,
            },
            {
                category: "request_detailing",
                type: "infoCard",
                subCategory: "characterAttribute",
                questionTitle: "Muliple characters?",
                questionDescription: `Can do! Additional characters will be charged with <span class="b7">80%</span> of your selected <span class="b7">"Character detail"</span>`,
                id: "character_attributes",
            },
            {
                category: "request_detailing",
                type: "fileUpload",
                subCategory: "character",
                questionTitle: "Upload your character(s)",
                questionDescription: `Upload your <span class="b7">character</span> of choice and their <span class="b7">accessories</span> references (sheet or images) here!`,
                id: "character_reference",
                required: true,
                maxFiles: 10,
            },
            {
                category: "request_detailing",
                type: "infoCard",
                subCategory: "characterAttribute",
                questionTitle: `Accessories`,
                questionDescription: `<span class="b7">Each</span> added accessories will be counted as a minimum of <span class="b7">€5</span>`,
                id: "character_attributes",
            },
            {
                category: "request_detailing",
                type: "textArea",
                subCategory: "requestText",
                questionTitle: "What do you have in mind?",
                questionDescription: "Briefly elaborate what you want me to draw for you",
                id: "request_text",
                placeholder: `You can leave this VERY brief and discuss it directly!`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "contact",
                questionTitle: "Give me a way we can chat for us to discuss further!",
                questionDescription: `
                Most active chats: <span class="b7">Discord</span>, <span class="b7">Twitter</span>, <span class="b7">Bluesky</span>. <br>
                If you have none of these, you could provide an <span class="b7">email address</span> instead`,
                id: "contacts",
                placeholder: `@yourTag OR your@email.com`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "nickname",
                questionTitle: "Give me a nickname",
                questionDescription: `
                (This is so just I could track you in the requests database!)
                `,
                id: "nickname",
                placeholder: `Potto, Mary, xXIDrinkBromineXx, etc.`,
                required: true,
            }
        ]
    },
    headshot: {
        title: "Headshot",
        description: "Headshot features the character's face and bust.",
        images: [
            { src: getImagePath(`imgs/showcase/portrait1.jpg`) },
            { src: getImagePath(`imgs/showcase/portrait2.jpg`) },
            { src: getImagePath(`imgs/showcase/portrait3.jpg`) },
            { src: getImagePath(`imgs/showcase/portrait4.jpg`) }
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
        isDisabled: false,
        configData: [
            {
                category: "general_configurations",
                subCategory: "characterRender",
                type: "singleChoice",
                id: "character_detail",
                options: [
                    {
                        optionName: "Sketch",
                        optionDescription: `Loose and feels more "Freestyle" <br>Freestyle coloring can be requested, naturally adds a little extra fee. <span style="font-family: var(--contentSecondary)">(Est. price addition: 5 ish)</span>`,
                        optionPrice: 15,
                        basePrice: true,
                        preChecked: true
                    },
                    {
                        optionName: "Lineart",
                        optionDescription: "Cleaner lines",
                        optionPrice: 25,
                    },
                    {
                        optionName: "Flat Color",
                        optionDescription: "Cleaner lines & Light render",
                        optionPrice: 35,
                    },
                    {
                        optionName: "Fully Rendered",
                        optionDescription: "Best render and visual",
                        optionPrice: 45,
                    },
                ],
                required: true,
            },
            {
                category: "general_configurations",
                subCategory: "bodyForm",
                type: "flipflop",
                id: "anthro",
                options: [
                    { optionName: "No", optionDescription: `quadruped shoulders!`, optionPrice: 0, preChecked: true },
                    { optionName: "Yes", optionDescription: "humanoid shoulders!", optionPrice: 0 },
                ],
            },
            {
                category: "general_configurations",
                subCategory: "background",
                type: "singleChoice",
                id: "background",
                options: [
                    {
                        optionName: "None/Simple",
                        optionDescription: "None at all (transparent)",
                        optionPrice: 0,
                        preChecked: true
                    },
                    {
                        optionName: "Simple",
                        optionDescription: "Solid, gradient, or even with quirky particles as backgrounds",
                        optionPrice: 0,
                        //preChecked: true
                    },
                    {
                        optionName: `"Photobash"`,
                        optionDescription: `
                        An art blending technique where it involves blending your character into existing photograph or any image.<br>
                        Simply provide me an image I should use!<br>
                        <br>
                        (Only available for <span class="b7">Fully Rendered</span> & <span class="b7">Flat Color</span> character detail)
                        `,
                        optionPrice: 10,
                        visibleIf: { questionId: "character_detail", value: ["Flat Color", "Fully Rendered"] }
                        //preChecked: true
                    },
                ],
                required: false,
            },
            {
                category: "request_detailing",
                type: "fileUpload",
                subCategory: "character",
                questionTitle: "Upload your character",
                questionDescription: `Upload your <span class="b7">character</span> of choice and their <span class="b7">accessories</span> references (sheet or images) here!`,
                id: "character_reference",
                required: true,
                maxFiles: 10,
            },
            {
                category: "request_detailing",
                type: "infoCard",
                subCategory: "characterAttribute",
                questionTitle: `Accessories`,
                questionDescription: `Depending on the accessory's complexity, <span class="b7">each</span> added accessories will be charged from <span class="b7">€0</span> and up.`,
                id: "character_attributes",
            },
            {
                category: "request_detailing",
                type: "textArea",
                subCategory: "requestText",
                questionTitle: "What do you have in mind?",
                questionDescription: "Briefly elaborate what you want me to draw for you",
                id: "request_text",
                placeholder: `You can leave this VERY brief and discuss it directly!`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "contact",
                questionTitle: "Give me a way we can chat for us to discuss further!",
                questionDescription: `
                Most active chats: <span class="b7">Discord</span>, <span class="b7">Twitter</span>, <span class="b7">Bluesky</span>. <br>
                If you have none of these, you could provide an <span class="b7">email address</span> instead`,
                id: "contacts",
                placeholder: `@yourTag OR your@email.com`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "nickname",
                questionTitle: "Give me a nickname",
                questionDescription: `
                (This is so just I could track you in the requests database!)
                `,
                id: "nickname",
                placeholder: `Potto, Mary, xXIDrinkBromineXx, etc.`,
                required: true,
            }
        ]
    },
    fullbody: {
        title: "Fullbody",
        description: "Display the full body of your character(s) of choice.",
        images: [
            { src: getImagePath(`imgs/showcase/fullbod1.jpg`) },
            { src: getImagePath(`imgs/showcase/fullbod2.jpg`) },
            { src: getImagePath(`imgs/showcase/fullbod3.jpg`) },
            { src: getImagePath(`imgs/showcase/fullbod4.jpg`), pos: "top" },
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
                category: "general_configurations",
                subCategory: "characterRender",
                type: "singleChoice",
                id: "character_detail",
                options: [
                    {
                        optionName: "Sketch",
                        optionDescription: `Loose and feels more "Freestyle" <br>Freestyle coloring can be requested, naturally adds a little extra fee. <span style="font-family: var(--contentSecondary)">(Est. price addition: 5 ish)</span>`,
                        optionPrice: 25,
                        basePrice: true,
                        preChecked: true
                    },
                    {
                        optionName: "Lineart",
                        optionDescription: "Cleaner lines",
                        optionPrice: 30
                    },
                    {
                        optionName: "Flat Color",
                        optionDescription: "Cleaner lines & Light render",
                        optionPrice: 45
                    },
                    {
                        optionName: "Fully Rendered",
                        optionDescription: "Best render and visual",
                        optionPrice: 60
                    },
                ],
                required: true,
            },
            {
                category: "general_configurations",
                subCategory: "bodyForm",
                type: "flipflop",
                id: "anthro",
                options: [
                    { optionName: "No", optionDescription: `"I like me some lil quadruped creatur"`, optionPrice: 0, preChecked: true },
                    { optionName: "Yes", optionDescription: "Anthro is significantly more complex than squishy ponies.", optionPrice: 10 },
                ],
            },
            {
                category: "general_configurations",
                subCategory: "background",
                type: "singleChoice",
                id: "background",
                options: [
                    {
                        optionName: "None/Simple",
                        optionDescription: "None at all (transparent), Solid, gradient, or even with quirky particles as backgrounds",
                        optionPrice: 0,
                        //preChecked: true
                    },
                    {
                        optionName: "Sketches",
                        optionDescription: "Background is drawn as sketches, little to no color",
                        optionPrice: 15,
                        //preChecked: true
                    },
                    {
                        optionName: `"Photobash"`,
                        optionDescription: "An art blending technique where it involves blending your character into existing photograph or any image. Simply provide me an image I should use!",
                        optionPrice: 25,
                        //preChecked: true
                    },
                    {
                        optionName: "Basic",
                        optionDescription: "Basic details, simplified rendering",
                        optionPrice: 35,
                        visibleIf: { questionId: "character_detail", value: ["Flat Color", "Fully Rendered"] }
                    },
                    {
                        optionName: "Complex",
                        optionDescription: `Complex and well rendered background. <br>(Only available for <span class="b7">Fully Rendered</span> character detail)`,
                        optionPrice: 50,
                        visibleIf: { questionId: "character_detail", value: "Fully Rendered" }
                    },
                    //{
                    //    optionName: "This is a robbery, fuck you",
                    //    optionDescription: `Fuck the wallet, I'm taking the whole bank`,
                    //    optionPrice: 7236493,
                    //    visibleIf: { questionId: "character_detail", value: "Fully Rendered" }
                    //},
                ],
                required: true,
            },
            {
                category: "general_configurations",
                subCategory: "nsfw",
                type: "flipflop",
                id: "nsfw",
                options: [
                    { optionName: "No", optionDescription: "Pure as a summer.", optionPrice: 0, preChecked: true },
                    { optionName: "Yes", optionDescription: "NSFW may require extra effort.", optionPrice: 15 },
                ],
            },
            {
                category: "request_detailing",
                type: "infoCard",
                subCategory: "characterAttribute",
                questionTitle: "Muliple characters?",
                questionDescription: `Can do! Additional characters will be charged with <span class="b7">80%</span> of your selected <span class="b7">"Character detail"</span>`,
                id: "character_attributes",
            },
            {
                category: "request_detailing",
                type: "fileUpload",
                subCategory: "character",
                questionTitle: "Upload your character(s)",
                questionDescription: `Upload your <span class="b7">character</span> of choice and their <span class="b7">accessories</span> references (sheet or images) here!`,
                id: "character_reference",
                required: true,
                maxFiles: 10,
            },
            {
                category: "request_detailing",
                type: "infoCard",
                subCategory: "characterAttribute",
                questionTitle: `Accessories`,
                questionDescription: `Depending on the accessory's complexity, <span class="b7">each</span> added accessories will be charged from <span class="b7">€5</span> and up.`,
                id: "character_attributes",
            },
            {
                category: "request_detailing",
                type: "textArea",
                subCategory: "requestText",
                questionTitle: "What do you have in mind?",
                questionDescription: "Briefly elaborate what you want me to draw for you",
                id: "request_text",
                placeholder: `You can leave this VERY brief and discuss it directly!`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "contact",
                questionTitle: "Give me a way we can chat for us to discuss further!",
                questionDescription: `
                Most active chats: <span class="b7">Discord</span>, <span class="b7">Twitter</span>, <span class="b7">Bluesky</span>. <br>
                If you have none of these, you could provide an <span class="b7">email address</span> instead`,
                id: "contacts",
                placeholder: `@yourTag OR your@email.com`,
                required: true,
            },
            {
                category: "contacts",
                type: "textArea",
                subCategory: "nickname",
                questionTitle: "Give me a nickname",
                questionDescription: `
                (This is so just I could track you in the requests database!)
                `,
                id: "nickname",
                placeholder: `Potto, Mary, xXIDrinkBromineXx, etc.`,
                required: true,
            }
        ],
    },
};