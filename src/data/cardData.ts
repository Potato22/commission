export interface FormQuestion {
    subCategory: string;
    id: string;
    type: "textarea" | "flipflop" | "singleChoice" | "fileUpload" | "infoCard" | "quantityCounter";
    options?: {
        optionName: string;
        optionDescription: string;
        optionPrice: number;
        basePrice?: boolean;
        preChecked?: boolean;
        visibleIf?: {
            questionId: string;
            value: "Fully Rendered"
        }
    }[];
    placeholder?: string; // for non radios
    questionTitle?: string; // for non radios
    questionDescription?: string; // for non radios
    required?: boolean;
    maxFiles?:number;
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
            //{
            //    subCategory: "chrDetail",
            //    type: "singleChoice",
            //    id: "character-detail",
            //    options: [
            //        {
            //            optionName: "Sketch",
            //            optionDescription: `Loose and feels more "Freestyle" <br>Freestyle coloring can be requested, naturally adds a little extra fee. <span style="font-family: var(--contentSecondary)">(Est. price addition: 5 ish)</span>`,
            //            optionPrice: 25,
            //            basePrice: true,
            //            preChecked: true
            //        },
            //        {
            //            optionName: "Linart",
            //            optionDescription: "Cleaner lines",
            //            optionPrice: 30
            //        },
            //        {
            //            optionName: "Flat Color",
            //            optionDescription: "Cleaner lines & Light render",
            //            optionPrice: 45
            //        },
            //        {
            //            optionName: "Fully Rendered",
            //            optionDescription: "Best render and visual",
            //            optionPrice: 60
            //        },
            //    ],
            //    required: true,
            //},
            //{
            //    subCategory: "bodyForm",
            //    type: "flipflop",
            //    id: "anthro",
            //    options: [
            //        { optionName: "No", optionDescription: `"I like me some lil quadruped creatur"`, optionPrice: 0, preChecked: true },
            //        { optionName: "Yes", optionDescription: "Anthro is significantly more complex than squishy ponies.", optionPrice: 10 },
            //    ],
            //},
            //{
            //    subCategory: "background",
            //    type: "singleChoice",
            //    id: "background",
            //    options: [
            //        {
            //            optionName: "None/Simple",
            //            optionDescription: "None at all (transparent), Solid, gradient, or even with quirky particles as backgrounds",
            //            optionPrice: 0
            //        },
            //        {
            //            optionName: "Basic",
            //            optionDescription: "Basic details, simplified rendering",
            //            optionPrice: 35
            //        },
            //        {
            //            optionName: "Complex",
            //            optionDescription: `Complex and well rendered background. <br>(Only available for <span class="b7">Fully Rendered</span> character detail)`,
            //            optionPrice: 50,
            //            visibleIf: { questionId: "character-detail", value: "Fully Rendered" }
            //        },
            //        {
            //            optionName: "This is a robbery, fuck you",
            //            optionDescription: `Fuck the wallet, I'm taking the whole bank`,
            //            optionPrice: 7236493,
            //            visibleIf: { questionId: "character-detail", value: "Fully Rendered" }
            //        },
            //    ],
            //    required: true,
            //},
            //{
            //    subCategory: "nsfw",
            //    type: "flipflop",
            //    id: "nsfw",
            //    options: [
            //        { optionName: "No", optionDescription: "Pure as a summer.", optionPrice: 0, preChecked: true },
            //        { optionName: "Yes", optionDescription: "NSFW may require extra effort.", optionPrice: 15 },
            //    ],
            //},
            {
                type: "fileUpload",
                subCategory: "character",
                questionTitle: "Upload your character",
                questionDescription: "Upload your character reference (sheet or images) here!",
                id: "character-reference",
                required: true,
                maxFiles: 5,
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
                subCategory: "contact",
                questionTitle: "Give me a way we can chat for us to discuss further!",
                questionDescription: `Most active chats: <span class="b7">Discord</span>, <span class="b7">Twitter</span>. <br>If you have none of these, you could provide an <span class="b7">email address</span> instead.`,
                id: "contacts",
                placeholder: `@yourTag OR your@email.com`,
                required: true,
            }
        ],
    },
};