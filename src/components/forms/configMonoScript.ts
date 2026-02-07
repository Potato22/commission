import Dropzone from "dropzone";
import { navigate } from "astro:transitions/client";
import { type CardData } from "../../data/cardData";
import { commState, cardList } from "../../data/cardData";
import { isTOSAccepted } from "../tosLogic";
import { dbSlotsPromise, slotCheckLS } from "../utils/slotCheck";
import { devConsole } from "../utils/devConsole";
import { withLoaderAnim } from "../utils/quirkyLoaderAsync";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const playground = commState.isClosed; //closed = true

import.meta.env.DEV ? console.log("%c" + "[DEV: configMonoScript] Worker rerouted to local", "color: orange; font-weight: bold;") : null;

function saveLastConfigPage() {
    //sabe last config page to localstorage
    const configWrap = document.getElementById("configWrap");
    if (configWrap) {
        const lookupConfigId = configWrap.dataset.configureId;
        if (lookupConfigId) {
            localStorage.setItem("lastConfigPage", lookupConfigId);
        }
    }
}

// Keep track of current state
let currentCleanup: (() => void) | null = null;
let isInitialized = false;

// Self-detect and initialize based on the page
function initializeIfNeeded() {
    // Clean up previous initialization if any
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
        isInitialized = false;
    }

    // Check if we're on a config page
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/config/')) return;

    // Find the config wrapper
    const configWrapper = document.getElementById("configWrap");
    if (!configWrapper) return;

    // Get the config ID
    const lookupConfigId = configWrapper.dataset.configureId as keyof typeof cardList;
    if (!lookupConfigId) return;

    // Get card data
    const cardData = cardList[lookupConfigId];

    // Initialize the page
    //devConsole(`\n\n\n\n\n\n\n\ninit requested, isInit: ${isInitialized}, for: ${lookupConfigId}`);

    initConfigPageLogic(cardData, lookupConfigId);

    //// Set up event listeners
    //const handleSomeEvent = () => {
    //    // Event handling logic
    //};

    //const someElement = document.getElementById("some-element");
    //someElement?.addEventListener("click", handleSomeEvent);

    // Store cleanup function
    currentCleanup = () => {
        //devConsole(`Shutting down.`);
        //someElement?.removeEventListener("click", handleSomeEvent);
        // Clean up other resources
    };

    isInitialized = true;
}

function setupListeners() {
    if ((window as any).__configMonoScriptListenersSet) return;

    document.addEventListener("astro:page-load", initializeIfNeeded);
    document.addEventListener("astro:before-swap", () => {
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
            isInitialized = false;
            devConsole("shutdown")
            //it's not really a shitdown perse, it's just more intuitive than to say "shut the fuck up stop firing the pulse again"
        }
    });

    (window as any).__configMonoScriptListenersSet = true;
}

// Self-initialize
setupListeners();

// If someone imports this module, they don't need to do anything else
export default {};

function initConfigPageLogic(cardData: CardData, lookupConfigId: string, command?: string) {
    devConsole("%c" + `[DEV: configMonoScript] Config logic started on ${lookupConfigId}`, "color: lightgreen; font-weight: bold;")

    async function configStateSlotIsFullCheck() {
        const submitString = document.querySelector('.submitString') as HTMLElement;
        const startConfig = document.getElementById('configButtonText') as HTMLElement;

        let dbSlots = slotCheckLS("get");
        let recacheEval

        if (submitString && dbSlots?.isFull) {
            submitString.textContent = "End Demo"
            startConfig.textContent = "Take a look"
        } else if (!dbSlots || dbSlots === undefined) {
            recacheEval = slotCheckLS("write", await dbSlotsPromise)
            dbSlots = recacheEval
            configStateSlotIsFullCheck();
        }
    }

    function initDz() {
        //const key = `initDz-${lookupConfigId}`;
        //if (initialized.has(key)) return;

        //devConsole('initDz fired')

        //destroy dropzone cus it's a crybaby
        if (Dropzone.instances.length > 0) Dropzone.instances.forEach(bz => bz.destroy());
        //devConsole('dz destroyed')

        const dzConfigFileSize: number = 19.0735;

        cardData.configData?.forEach((config) => {
            if (config.type === "fileUpload") {
                const dzElem = document.getElementById(`dropZone_${config.id}`);
                const validityInfo = document.querySelector(".validFileInfo");
                const fileTypeSpan = document.getElementById("errReason-fileType");
                const fileSizeSpan = document.getElementById("errReason-fileSize");
                const fileCountSpan = document.getElementById("errReason-fileCount");

                //const dropzonInstance = document.getElementById(`dropZone_${config.id}`) as HTMLElement & { dropzone?: Dropzone };
                //if (!dropzonInstance?.dropzone) {
                //    return
                //}

                if (dzElem) {
                    new Dropzone(dzElem, {
                        url: "#",
                        autoProcessQueue: false,
                        maxFiles: config.maxFiles ? config.maxFiles : 0,
                        maxFilesize: dzConfigFileSize, //IT'S FUCKING MEGABYTES NOT "BYTES" WHO WROTE THE FUCKING DOC
                        acceptedFiles: ".png,.jpg,.jpeg",
                        addRemoveLinks: true,
                        dictDefaultMessage: "upload_file",
                        dictRemoveFile: "Remove",

                        init: function () {
                            this.on("maxfilesexceeded", function (this: Dropzone, file) {
                                this.removeFile(file);
                                dzElem.classList.add("errNudge");
                                fileCountSpan?.classList.add("errCulprit");
                                setTimeout(() => {
                                    dzElem.classList.remove("errNudge");
                                    fileCountSpan?.classList.remove("errCulprit");
                                }, 500);
                            });
                            this.on("addedfile", function (this: Dropzone, file) {
                                if (file.size > dzConfigFileSize * 1024 * 1024) {
                                    this.removeFile(file);
                                    dzElem.classList.add("errNudge");
                                    fileSizeSpan?.classList.add("errCulprit");
                                    setTimeout(() => {
                                        dzElem.classList.remove("errNudge");
                                        fileSizeSpan?.classList.remove("errCulprit");
                                    }, 500);
                                    return;
                                } else if (
                                    !["image/png", "image/jpeg", "image/jpg"].includes(file.type)
                                ) {
                                    this.removeFile(file);
                                    dzElem.classList.add("errNudge");
                                    fileTypeSpan?.classList.add("errCulprit");
                                    setTimeout(() => {
                                        dzElem.classList.remove("errNudge");
                                        fileTypeSpan?.classList.remove("errCulprit");
                                    }, 500);
                                    return;
                                } else {
                                    dzElem.classList.add("drop");
                                    setTimeout(() => {
                                        dzElem.classList.remove("drop");
                                    }, 400);
                                }
                            });

                            this.on("addedfile", (file) => { });
                        },
                    });
                    const injectGoogleIcon = dzElem.querySelector(".dz-button");
                    if (injectGoogleIcon) {
                        injectGoogleIcon.classList.add("material-symbols-rounded");
                    }
                }
            }
        });
        //initialized.add(key);
    }

    function updateConditionalOptions() {
        //devConsole('updateConditionalOptions fired')
        //searcha all
        document.querySelectorAll(".conditionalOpt").forEach((elem) => {
            const theThingie = elem as HTMLElement;
            const visibleIf = theThingie.getAttribute("data-visible-if") as string;
            if (!visibleIf) return;
            try {
                const cond = JSON.parse(visibleIf);
                // radio group
                const selected = document.querySelector(
                    `input[name="${cond.questionId}"]:checked`
                ) as HTMLInputElement;

                let shouldShow = false;
                if (selected) {
                    if (Array.isArray(cond.value)) {
                        shouldShow = cond.value.includes(selected.value);
                    } else {
                        shouldShow = selected.value === cond.value;
                    }
                }
                if (shouldShow) {
                    theThingie.style.display = "";
                    theThingie.classList.remove("radioDisabled");
                } else {
                    // theThingie.style.display = "flex";
                    theThingie.classList.add("radioDisabled");
                    //failsafe, nullify precheck if hidden
                    const input = theThingie.querySelector('input[type="radio"]');
                    if (input) (input as HTMLInputElement).checked = false;
                }
            } catch (e) { }
        });
    }
    updateConditionalOptions();

    function setupFormValidation() {
        //devConsole(`setupFormValidation fired`)

        const configForm = document.getElementById(
            "configWindow"
        ) as HTMLFormElement;
        const checkPulse = document.getElementById(
            "errAnchor"
        ) as HTMLButtonElement;

        //mini mem for err list
        const validatedFields = new Set();

        let errorContainer = (configForm ? configForm.querySelector(".formInvalidErr") : null);
        if (!(errorContainer && configForm)) {
            errorContainer = document.createElement("div");
            errorContainer.className = "formInvalidErr";
            configForm?.insertBefore(errorContainer, checkPulse);
        }

        return {
            validate: (event: Event) => {
                //reset
                errorContainer.innerHTML = "";
                let hasErrors = false;

                //required radio groups
                const radioGroups: Record<string, HTMLInputElement[]> = {};
                configForm
                    .querySelectorAll('input[type="radio"][required]')
                    .forEach((radio) => {
                        const name = (radio as HTMLInputElement).getAttribute(
                            "name"
                        ) as string;
                        if (!radioGroups[name]) {
                            radioGroups[name] = [];
                        }
                        radioGroups[name].push(radio as HTMLInputElement);
                    });

                //each radio
                Object.entries(radioGroups).forEach(([name, radios]) => {
                    // Check if any radio in this group is checked
                    const isChecked = radios.some((radio) => radio.checked);

                    if (!isChecked) {
                        hasErrors = true;

                        //pull section name
                        let sectionName: string = name;
                        const formComponent = radios[0].closest(".formComponent");
                        const parentElement = formComponent
                            ? formComponent.parentElement
                            : null;
                        const subCategoryEl = parentElement
                            ? parentElement.previousElementSibling
                            : null;
                        if (
                            subCategoryEl &&
                            subCategoryEl.classList.contains("subCategoryBox")
                        ) {
                            const subCatTitle = subCategoryEl.querySelector(".subCategory");
                            if (subCatTitle && subCatTitle.textContent !== null) {
                                sectionName = subCatTitle.textContent;
                            }
                        }

                        //err push
                        const errorMsg = document.createElement("div");
                        errorMsg.innerHTML = `Nothing is selected in <span class="b7">${sectionName}</span> !`;
                        errorMsg.className = "errBlob";
                        errorContainer.appendChild(errorMsg);

                        //scroller
                        if (!validatedFields.has(name)) {
                            const formComponent = radios[0].closest(".formComponent");
                            formComponent?.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                            validatedFields.add(name);
                        }
                    }
                });

                // Check required text areas
                configForm.querySelectorAll("textarea[required]").forEach((elem) => {
                    const textarea = elem as HTMLTextAreaElement;
                    if (!textarea.value.trim()) {
                        hasErrors = true;

                        // Find the textarea title for better error message
                        const textAreaTitle = (
                            textarea.parentElement?.querySelector(
                                ".textAreaTitle"
                            ) as HTMLElement
                        )?.textContent?.replace(" *", "");

                        const errorMsg = document.createElement("div");
                        errorMsg.innerHTML = `<span class="b7">${textAreaTitle}</span> is required!`;
                        errorMsg.className = "errBlob";
                        errorContainer.appendChild(errorMsg);

                        // Scroll to the first error
                        if (!validatedFields.has(textarea.id)) {
                            textarea.scrollIntoView({ behavior: "smooth", block: "center" });
                            validatedFields.add(textarea.id);
                        }
                    }
                });
                configForm.querySelectorAll('input[type="email"][required]').forEach((elem) => {
                    const emailInput = elem as HTMLInputElement;
                    const value = emailInput.value.trim();

                    // Let the browser do the validation, then check the result
                    if (!value || !emailInput.validity.valid) {
                        hasErrors = true;

                        // Find the config for this email input by id
                        const emailConfig = cardData.configData?.find(
                            (cfg) => cfg.id === emailInput.id
                        );
                        const emailTitle = emailConfig?.questionTitle || emailInput.name || emailInput.id;

                        const errorMsg = document.createElement("div");
                        // You can even use the browser's built-in error message
                        const browserMessage = emailInput.validationMessage;
                        errorMsg.innerHTML = `<span class="b7">${emailTitle}</span>: ${browserMessage}`;
                        errorMsg.className = "errBlob";
                        errorContainer.appendChild(errorMsg);

                        if (!validatedFields.has(emailInput.id)) {
                            emailInput.scrollIntoView({ behavior: "smooth", block: "center" });
                            validatedFields.add(emailInput.id);
                        }
                    }
                });

                if (hasErrors) {
                    event.preventDefault();
                }

                // Check file uploads (moved from initPseudoSubmit)
                cardData.configData?.forEach((config) => {
                    if (config.type === "fileUpload" && config.required) {
                        const dzElem = document.getElementById(`dropZone_${config.id}`);
                        if (dzElem && dzElem.dropzone) {
                            const dzFiles = dzElem.dropzone.getAcceptedFiles();
                            if (dzFiles.length === 0) {
                                hasErrors = true;
                                const errorMsg = document.createElement("div");
                                errorMsg.innerHTML = `<span class="b7">${config.questionTitle || config.id}</span> is required!`;
                                errorMsg.className = "errBlob";
                                errorContainer.appendChild(errorMsg);
                                dzElem.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                        }
                    }
                });

                if (hasErrors) {
                    return { isValid: false };
                }

                //fires if all valid
                const formData = new FormData(configForm);

                // Return both the processed data object and the form data
                return { isValid: true, formData };
            },
        };
    }

    function collector(configFormElem?: HTMLFormElement) {
        const data: Record<string, string | number | File | File[] | string | string[]> = {};
        const formData = new FormData(configFormElem);

        setupFormValidation();

        if (cardData.configData) {
            for (const field of cardData.configData) {
                const values = formData.getAll(field.id);

                // multiple files?
                if (values.length > 1 && values[0] instanceof File) {
                    const files = (values as File[]);
                    data[field.id] = files;
                    // grab all the MIME types
                    data[`${field.id}_types`] = files.map(f => f.type);
                }
                // exactly one file?
                else if (values[0] instanceof File) {
                    const file = values[0] as File;
                    data[field.id] = file;
                    // store its type too
                    data[`${field.id}_type`] = file.type;
                }
                // plain text / number
                else if (values[0] != null) {
                    data[field.id] = values[0].toString();
                }
            }
        }

        cardData.configData?.forEach(config => {
            if (config.type === "fileUpload") {
                const dzElem = document.getElementById(`dropZone_${config.id}`);
                if (dzElem?.dropzone) {
                    const dzFiles = dzElem.dropzone.getAcceptedFiles();
                    if (dzFiles.length) {
                        // append files to your FormData
                        dzFiles.forEach(file => {
                            formData.append(config.id, file, file.name);
                        });
                        data[config.id] = dzFiles.length === 1 ? dzFiles[0] : dzFiles;

                        // and here’s your MIME info
                        if (dzFiles.length === 1) {
                            data[`${config.id}_type`] = dzFiles[0].type;
                        } else {
                            data[`${config.id}_types`] = dzFiles.map(f => f.type);
                        }
                    }
                }
            }
        });

        data.est_price = priceAdd;
        formData.append("est_price", priceAdd.toString());

        data.cardId = lookupConfigId;
        formData.append("type", lookupConfigId);

        return { data, formData };
    }


    async function initPseudoSubmit() {
        const configForm = document.getElementById("configWindow") as HTMLFormElement;
        const proceedBtn = document.getElementById("proceedBtn") as HTMLButtonElement;

        const devSkipCheck = true && import.meta.env.DEV;

        const dbSlots = slotCheckLS("get");


        if (!(configForm && proceedBtn)) {
            return
        }
        // FORM PACKAGING

        function pseudoSubmit(event: Event) {
            const { validate } = setupFormValidation();
            const result = validate(event);



            // OK if slots are not full, not in dev, and not in playground
            const globalRule = !dbSlots?.isFull && !devSkipCheck && !playground;
            if (globalRule && !result.isValid) {
                event.preventDefault();
                return;
            }

            //collect
            const { data } = collector(configForm);

            summaryDisplayControl("open", data);
        }

        if (dbSlots?.isFull || (playground && !devSkipCheck)) {
            console.log("%c" + "[i] Commissions are closed but interactivity is enabled, validation is being skipped.", "color: cyan; font-weight: bold;");
        }

        if (devSkipCheck) {
            devConsole("%c" + "[DEV] Validation is being skipped.", "color: red; font-size: 2rem; font-weight: bold;");
        }

        proceedBtn.addEventListener("click", pseudoSubmit);
    }
    //summaryDisplayControl("open");

    function generateSummary(
        formData: Record<string, string | number | File | File[] | string | string[]>,
        targetElement: HTMLElement
    ) {
        // Safety check for formData
        if (!formData || typeof formData !== "object") {
            console.error("Invalid form data provided to generateSummary");
            return;
        }
        devConsole("%c" + "[DEV] Payload ↴", "color: lightgreen; font-weight: bold;")
        devConsole(formData)

        //reset
        targetElement.innerHTML = "";

        const keysToDisplay = {
            nickname: "Inquiry for:",
            character_detail: "Character Detail",
            anthro: "Anthro?",
            background: "Background Art",
            specialty: "Specialty",
            nsfw: "NSFW?",
            character_count: "Character Count",
            accessories_count: "Accessory count",
            version_count: "Versions",
            sketch_quantity: "Sketch Quantity",
            color_quantity: "Colored Sketch Quantity",
            request_text: "Request",
            contacts: "Contact Information",
            invoicing: "Invoice Email",
        };

        // Generate HTML for each key
        for (const [key, displayName] of Object.entries(keysToDisplay)) {
            if (formData[key]) {
                const fragment = createSummaryFragment(
                    displayName,
                    String(formData[key])
                );
                targetElement.appendChild(fragment);
            }
        }

        // Add image count if there are character references
        if (formData["character_reference"]) {
            let imageCount = 0;

            if (Array.isArray(formData["character_reference"])) {
                // Multiple images case
                imageCount = formData["character_reference"].length;
            } else {
                // Single image case
                imageCount = 1;
            }

            const fragment = createSummaryFragment(
                "Reference Images",
                `${imageCount} image${imageCount !== 1 ? "s" : ""}`
            );
            targetElement.appendChild(fragment);
        }

        //pull est_price
        if (formData["est_price"]) {
            const fragment = createSummaryFragment(
                "Estimated Price",
                `€${formData["est_price"]}`
            );
            targetElement.appendChild(fragment);
        }
    }

    function createSummaryFragment(title: string, value: string) {
        const template = document.createElement("template");
        template.innerHTML = `
        <div class="formComponent">
          <div class="ocHeader">
            <div class="ocCell1">
              <div class="optionTitle ${title === "Request" ? "longTextTitle" : ""}">${title}</div>
            </div>
          </div>
          <div
            class="optionDesc ${title === "Request" ? "longText" : ""}"
            >${value}</div>
        </div>
      `;
        return template.content;
    }

    async function summaryDisplayControl(
        mode: string | null,
        appendedFormData: Record<string, string | number | File | File[] | string | string[]> | null
    ) {
        const startButton = document.getElementById("startConfig") as HTMLElement;

        const summaryWindow = document.getElementById("configSummary") as HTMLElement;
        const summaryButtons = document.getElementById("confirmButtons") as HTMLElement;
        const summaryGoBack = document.getElementById('summary-cancelConfirm') as HTMLElement;
        const summaryProceedButton = document.getElementById('summary-proceed') as HTMLElement;
        const summaryNoTos = document.getElementById('summary-noTos') as HTMLElement;
        const summaryHeading = document.getElementById("confirmText") as HTMLElement;
        const summaryGrid = document.getElementById("pickedConfigGrid") as HTMLElement;
        const loadAnim = document.getElementById("loadAnim") as HTMLElement;
        const loadBar = document.getElementById("gradbar") as HTMLElement;
        const loadString = document.getElementById("loadStatString") as HTMLElement;
        const mobileScrollInd = document.getElementById("scrollInd") as HTMLElement;

        const configForm = document.getElementById("configWindow") as HTMLFormElement;

        if (!configForm) {
            return
        }

        function letsRead() {
            saveLastConfigPage();
            summaryNoTos.addEventListener("click", () => navigate("/tos"));
        }

        // Only get formData if we need it
        let formData: FormData;
        if (mode === "proceed") {
            formData = collector(configForm).formData;
        }

        switch (mode) {
            case "open":
                summaryDisplayControl("reset", {});

                //gen summary
                if (appendedFormData) {
                    generateSummary(appendedFormData, summaryGrid);
                }

                summaryWindow.style.display = "flex";
                setTimeout(() => {
                    summaryWindow.classList.add("active");
                }, 10);
                break;
            case "close":
                summaryButtons.style.opacity = "0";
                summaryButtons.style.transform = "translateY(2em)";
                setTimeout(() => {
                    summaryWindow.classList.remove("active");
                    setTimeout(() => {
                        summaryWindow.style.display = "none";
                    }, 300);
                }, 100);
                break;
            case "proceed":
                summaryHeading.style.opacity = "0";
                summaryButtons.style.opacity = "0";
                summaryButtons.style.pointerEvents = "none"
                summaryGrid.style.opacity = "0";
                mobileScrollInd.style.opacity = "0"
                summaryButtons.style.transform = "translateY(2em)";
                loadString.innerHTML = "Sending...";
                loadBar.classList.remove("loadOK");
                loadBar.classList.remove("loadErr");
                loadBar.classList.remove("loadDemo");

                setTimeout(() => {
                    loadAnim.style.display = "flex";

                    //fire worker submitter, read success return
                    submitFormToWorker(formData).then(({ success, error }) => {
                        if (success) {
                            loadBar.classList.add("loadOK");
                            loadString.innerHTML = `Thank you!`;
                            setTimeout(() => {
                                summaryDisplayControl("close", {});
                                configDisplayControl(false);
                                setTimeout(() => {
                                    navigate("/");
                                }, 500);
                            }, 2000);
                            startButton.classList.add("disabled");
                        } else {
                            const whatIfItsOnlyFullSlots = slotCheckLS("get")?.isFull ? "loadDemo" : "loadErr";
                            loadBar.classList.add((cardData.isDisabled || commState.isClosed) && !import.meta.env.DEV ? "loadDemo" : whatIfItsOnlyFullSlots);
                            loadString.innerHTML = `<span style="color: var(--accent)">fail:</span> ${error ?? "unknown error"}`;
                            setTimeout(() => summaryDisplayControl("close", {}), (cardData.isDisabled || commState.isClosed) ? 5000 : 2000);
                        }
                    });
                }, 300);
                break;
            case "noTos":
                summaryHeading.style.opacity = "0";
                summaryButtons.style.opacity = "0";
                summaryButtons.style.pointerEvents = "none"
                summaryGrid.style.opacity = "0";
                mobileScrollInd.style.opacity = "0"
                summaryButtons.style.transform = "translateY(2em)";
                await sleep(300);

                loadBar.classList.add("loadDemo");
                loadAnim.style.display = "flex";
                summaryButtons.style.transform = "translateY(0em)";
                await sleep(1000)

                letsRead();
                summaryHeading.innerHTML = "Let's read the TOS first..."
                summaryHeading.innerHTML = "Let's read the TOS first..."
                summaryHeading.style.opacity = "1";
                summaryButtons.style.opacity = "1";
                summaryButtons.style.pointerEvents = "all"
                mobileScrollInd.style.display = "none";
                summaryGrid.style.display = "none";
                loadAnim.style.opacity = "0";
                summaryGoBack.innerHTML = "Hold on"
                summaryProceedButton.style.display = "none"
                summaryNoTos.style.display = "block"
                break;
            case "reset":
                loadAnim.style.display = "none";
                summaryHeading.style.opacity = "1";
                summaryButtons.style.opacity = "1";
                summaryButtons.style.transform = "";
                summaryGrid.style.opacity = "1";
                mobileScrollInd.style.opacity = "1"
                summaryButtons.style.pointerEvents = "auto"
                break;
            default:
                break;
        }
    }

    function initSummaryButtons() {
        //const key = `initSummaryButtons-${lookupConfigId}`;
        //if (initialized.has(key)) return;
        const goBack = document.getElementById("summary-cancelConfirm") as HTMLElement;
        const iAmSure = document.getElementById("summary-proceed") as HTMLElement;

        if (!(goBack && iAmSure)) {
            return;
        }

        // Remove existing event listeners (if any)
        const oldGoBack = goBack.cloneNode(true);
        const oldIAmSure = iAmSure.cloneNode(true);

        if (goBack.parentNode && iAmSure.parentNode) {
            goBack.parentNode.replaceChild(oldGoBack, goBack);
            iAmSure.parentNode.replaceChild(oldIAmSure, iAmSure);
        }

        (oldGoBack as HTMLElement).addEventListener("click", () =>
            summaryDisplayControl("close", {})
        );
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                summaryDisplayControl("close", {});
            }
        });
        (oldIAmSure as HTMLElement).addEventListener("click", () => {
            const status = getSubmissionStatus();
            if (status.isIdeal || status.isClosed || (status.isDev && status.tosAccepted)) {
                summaryDisplayControl("proceed", {});
            } else if (!status.tosAccepted) {
                summaryDisplayControl("noTos", {});
            }
        }
        );
        //initialized.add(key);
    }

    type SubmissionResult = {
        success: boolean;
        error?: string;
    };

    function getSubmissionStatus() {
        const tosAccepted = isTOSAccepted();
        const isClosed = cardData.isDisabled || commState.isClosed || slotCheckLS("get")?.isFull;
        const isDev = import.meta.env.DEV;

        // tos AND NOT closed
        const isIdeal = tosAccepted && !isClosed;

        // NOT tos AND closed
        const isDemo = !tosAccepted && isClosed;

        // ideal OR demo mode OR dev mode
        //const allowAnyway = isIdeal || isDemo;

        devConsole("%c" + `[DEV: getSubmissionStatus]`, "color: lightblue; font-weight: bold;");
        devConsole("  tosAccepted: ______________________", tosAccepted);
        devConsole("  isClosed: _________________________", isClosed);
        devConsole("  isDev: ____________________________", isDev);
        devConsole("  ----------------------")
        devConsole("  isIdeal (TOS true, Closed false):  ", isIdeal);
        devConsole("  isDemo (TOS NOT true, Closed true):", isDemo);
        //devConsole("  allowAnyway (TOS true):", allowAnyway);

        return {
            tosAccepted,
            isClosed,
            isDev,
            isIdeal,
            isDemo,
            //allowAnyway,
        };
    }

    //if PROCEED is passed
    async function submitFormToWorker(
        formData: FormData | null
    ): Promise<SubmissionResult> {

        const status = getSubmissionStatus();

        if (!status.isIdeal) {
            if (status.isClosed || status.tosAccepted) {
                return {
                    success: false,
                    error: "Well. It's closed, but thanks for trying the website!",
                };
            } else if (!status.tosAccepted) {
                return {
                    success: false,
                    error: "... Please read the TOS first.",
                };
            }
        }


        const workerToggle = () => {
            if (status.isDev) {
                alert('dev');
                return "http://127.0.0.1:8787"
            }
            if (status.isIdeal && !status.isDev) {
                return "https://pottocomm-collector.pottoart.workers.dev/"
            } else {
                return "demo"
            }
        }

        const WORKER_URL: URL | string = workerToggle()

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                let msg = `${response.status}`;
                try {
                    const errorJson = await response.json();
                    if (errorJson?.message) {
                        msg += ` - ${errorJson.message}`;
                    }
                } catch {
                    // fallback if not JSON
                    msg += ` - ${response.statusText}`;
                }
                throw new Error(msg);
            }

            const result = await response.json();
            //devConsole("Submission successful:", result);
            return { success: true };
        } catch (err: unknown) {
            console.error("failure sending:", err);
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }


    function animateNumber(
        elem: HTMLElement,
        start: number,
        end: number,
        duration = 500
    ) {
        const startTime = performance.now();

        function update(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Linear interpolation (lerp)
            const value = Math.round(start + (end - start) * progress);
            elem.textContent = `€${value.toFixed(2)}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
        //devConsole(`animateNumber: ${start} -> ${end}`)
    }

    let priceAdd: number = 0;
    let lastPrice = cardData.price;

    function updatePrice() {
        const priceElem = document.getElementById("priceCalc");
        if (priceElem) {
            //const newPrice = cardData.price + priceAdd;
            const newPrice = 0 + priceAdd;
            animateNumber(priceElem, lastPrice, newPrice);
            lastPrice = newPrice;
            //devConsole(`updatePrice: ${lastPrice}`)
        }
    }

    function getSelectedOptionPrice(
        config: {
            id: string;
            options?: { optionName: string; optionPrice: number }[];
        },
        form: HTMLElement
    ) {
        if (!config || !config.options) return 0;
        // For radio/flipflop, find the checked input
        const selected = form.querySelector(`input[name="${config.id}"]:checked`) as HTMLInputElement;
        if (!selected) return 0;
        const selectedValue = (selected as HTMLInputElement).value;
        const found = config.options.find((opt) => opt.optionName === selectedValue);
        return found ? found.optionPrice : 0;
    }

    function recalculatePrice() {
        const date = new Date();
        const dH = date.getHours();
        const dM = date.getMinutes();
        const dS = date.getSeconds();
        //devConsole(`${dH}:${dM}:${dS} recalculatePrice fired`)
        const configForm = document.getElementById("configWindow");
        let totalAdd = 0;

        if (cardData.configData && configForm) {
            // Get all configs first
            const detailConfig = cardData.configData.find(config => config.id === "character_detail");

            //devConsole(`GSOP called from: charDet :: ${detailConfig?.options?.map(opt => opt.optionName)}, #configWindow`)
            const characterDetailPrice = detailConfig ? getSelectedOptionPrice(detailConfig, configForm) : 0;
            //devConsole(`\n[<-] charDet:`)
            //devConsole(`   L id = ${detailConfig?.id}`)
            //devConsole(`   L price = ${characterDetailPrice}`)
            const characterCountConfig = cardData.configData.find(config => config.type === "characterCount");

            // Process each config for price calculation
            cardData.configData.forEach((config) => {
                // Only process singleChoice/flipflop if it's NOT the character_detail
                // This prevents double counting the base price
                if ((config.type === "singleChoice" || config.type === "flipflop") && config.id !== "character_detail") {
                    totalAdd += getSelectedOptionPrice(config, configForm);
                    //devConsole(`GSOP called from: forEach singleChoice :: ${config?.options?.map(opt => opt.optionName)}, #configWindow`)
                }
                else if (config.type === "quantityCounter") {
                    const input = document.getElementById(config.id) as HTMLInputElement;
                    const quantity = input && (parseInt(input.value) || 0);
                    //devConsole(`\n[@] quantityCounter:`)
                    //devConsole(`    L id = ${config.id}`)
                    //devConsole(`    L perPrice = ${config.perPrice}`)
                    //devConsole(`    L eval = ${quantity} * ${config.perPrice || 0}`)
                    totalAdd += quantity * (config.perPrice || 0);
                }
            });

            // Handle character_detail and characterCount together to avoid double counting
            if (characterCountConfig) {
                const input = document.getElementById(characterCountConfig.id) as HTMLInputElement;
                const count = input && (parseInt(input.value) || 0);
                //devConsole(`\n[@] characterCountConfig:`)
                //devConsole(`    L count = ${count}`)
                //devConsole(`    L charDetPrice = ${characterDetailPrice}`)

                // Always add the base character price once
                totalAdd += characterDetailPrice;

                if (count > 1) {
                    totalAdd += (count - 1) * (characterDetailPrice * 0.8);
                }
            } else {
                // If there's no characterCount, still add the character_detail price once
                totalAdd += characterDetailPrice;
            }
        }

        // DEBUG LOG: Price Breakdown
        const debugParts: string[] = ["0"];
        const basePrice = cardData.price;
        //debugParts.push(`${basePrice} (base)`);

        if (cardData.configData && configForm) {
            const detailConfig = cardData.configData.find(config => config.id === "character_detail");
            const characterDetailPrice = detailConfig ? getSelectedOptionPrice(detailConfig, configForm) : 0;

            cardData.configData.forEach((config) => {
                if ((config.type === "singleChoice" || config.type === "flipflop") && config.id !== "character_detail") {
                    const price = getSelectedOptionPrice(config, configForm);
                    if (price > 0) {
                        debugParts.push(`${price} (${config.id})`);
                    }
                }
                else if (config.type === "quantityCounter") {
                    const input = document.getElementById(config.id) as HTMLInputElement;
                    const quantity = input && (parseInt(input.value) || 0);
                    const perPrice = config.perPrice || 0;
                    const evalTotal = quantity * perPrice;
                    if (evalTotal > 0) {
                        debugParts.push(`${evalTotal} (${quantity}×${perPrice} - ${config.id})`);
                    }
                }
            });

            const characterCountConfig = cardData.configData.find(config => config.type === "characterCount");
            if (characterCountConfig) {
                const input = document.getElementById(characterCountConfig.id) as HTMLInputElement;
                const count = input && (parseInt(input.value) || 0);
                const baseChar = characterDetailPrice;
                if (baseChar > 0) {
                    debugParts.push(`${baseChar} (char detail)`);
                    if (count > 1) {
                        const extra = (count - 1) * (baseChar * 0.8);
                        debugParts.push(`${extra} (${count - 1}×${baseChar * 0.8} - extra chars)`);
                    }
                }
            } else if (characterDetailPrice > 0) {
                debugParts.push(`${characterDetailPrice} (char detail)`);
            }
        }

        //devConsole(`\n[DEBUG] Price formula: ${debugParts.join("\n+\n")}`);

        priceAdd = totalAdd;
        //devConsole(`\nrecalculatePrice: ${priceAdd}`)
        updatePrice();
    }

    function initPriceCalc() {
        //const key = `initPriceCalc-${lookupConfigId}`;
        //if (initialized.has(key)) return;
        const configForm = document.getElementById("configWindow");
        //devConsole(`initPriceCalc fired`)
        configForm?.removeEventListener("change", recalculatePrice);


        if (configForm) {
            //devConsole("realtime price calc")
            configForm.addEventListener("change", recalculatePrice);
        }
        //devConsole(`[->] initPriceCalc calls RCP`)
        recalculatePrice();
        //initialized.add(key);
    }

    function backUtil() {
        if (window.history.state?.index > 0) {
            // Go back if there's history to go back to
            navigate('/', { history: 'replace' });
        } else {
            // Otherwise navigate to home explicitly
            navigate('/', { history: 'auto' });
        }
        backButtonListenerReset()
    }

    function initbackButton() {
        //devConsole(`initbackButton fired`)
        const backBs = document.querySelectorAll(".backB, .backBMobile");
        backBs.forEach(backElem => {
            backElem.addEventListener("click", backUtil);
        });
    }
    function backButtonListenerReset() {
        const backBs = document.querySelectorAll(".backB, .backBMobile");
        backBs.forEach(backElem => {
            backElem.removeEventListener("click", backUtil);
        });
    }


    function configDisplayControl(command: boolean) {
        const infoBox = document.getElementById("infobox") as HTMLElement;
        const configWindow = document.getElementById("configWindow") as HTMLElement;
        const configStatus = document.getElementById("configStatus") as HTMLElement;
        const cardBody = document.querySelector(".cardBody") as HTMLElement;
        const imgGrid = document.querySelector(".imgGrid") as HTMLElement;
        const imgGridMobile = document.querySelector(".imgGridMobile") as HTMLElement;
        const backBMobile = document.querySelector(".backBMobile") as HTMLElement;
        const startButton = document.getElementById("startConfig") as HTMLElement;

        window.scrollTo(0, 0)

        switch (command) {
            case true:
                infoBox.classList.add("animExit");
                imgGridMobile.classList.add("configuring");
                backBMobile.classList.add("configuring")

                setTimeout(() => {
                    infoBox.style.display = "none";
                    infoBox.classList.remove("animExit");
                    startButton.classList.add("configGo");
                    cardBody.classList.add("configuring");
                    imgGrid.classList.add("configuring");
                    configStatus.classList.add("active");
                    configWindow.classList.add("animEnter");
                    configWindow.style.display = "flex";
                    imgGridMobile.style.display = "none"
                    setTimeout(() => {
                        configWindow.classList.remove("animEnter");
                        infoBox.classList.remove("animExit");
                    }, 1);
                }, 300);
                break;
            case false:
                imgGridMobile.style.display = ""
                configWindow.classList.add("animExit");
                setTimeout(() => {
                    configWindow.style.display = "none";
                    startButton.classList.remove("configGo");
                    cardBody.classList.remove("configuring");
                    imgGrid.classList.remove("configuring");
                    imgGridMobile.classList.remove("configuring");
                    backBMobile.classList.remove("configuring");
                    configStatus.classList.remove("active");
                    infoBox.classList.add("animEnter");
                    infoBox.style.display = "flex";
                    setTimeout(() => {
                        infoBox.classList.remove("animEnter");
                        configWindow.classList.remove("animExit");
                    }, 1);
                }, 300);
                break;
        }
    }
    function initConfigControl() {
        const startButton = document.getElementById("startConfig") as HTMLElement;
        const close = document.getElementById("cancel") as HTMLElement;

        startButton?.removeEventListener("click", openConfig);
        close?.removeEventListener("click", closeConfig);

        //skip
        //configDisplayControl(true);

        function openConfig() {
            configDisplayControl(true);
            //updatePrice();
        }
        function closeConfig() {
            configDisplayControl(false);
        }

        startButton?.addEventListener("click", openConfig);
        close?.addEventListener("click", closeConfig);
    }

    function quantityController() {
        const customInputs: NodeListOf<Element> = document.querySelectorAll('.formComponent.qc');
        const qcErrGroup = document.getElementById("qcErr") as HTMLElement;

        if (!customInputs?.length) {
            return;
        }

        // Configuration constants
        const ERROR_DURATION_MS = 200;
        const DEFAULT_MIN = 0;
        const DEFAULT_MAX = 1;

        // Types for improved code clarity
        type ValidationResult = {
            isValid: boolean;
            message?: string;      // Message for individual controls (MIN/MAX)
            groupMessage?: string; // Group-specific message
            direction?: 'up' | 'down' | undefined;
        };

        // Central validation functions for group constraints
        const groupValidation = {
            getSum(groupName: string): number {
                const groupInputs = document.querySelectorAll(`input[data-group="${groupName}"]`);
                return Array.from(groupInputs).reduce((sum, input) =>
                    sum + (parseInt((input as HTMLInputElement).value) || 0), 0);
            },

            hasNonZeroValue(groupName: string): boolean {
                const groupInputs = document.querySelectorAll(`input[data-group="${groupName}"]`);
                return Array.from(groupInputs).some(input =>
                    parseInt((input as HTMLInputElement).value) > 0);
            },

            isUnderMaxLimit(groupName: string, maxSum: number): boolean {
                return this.getSum(groupName) <= maxSum;
            },

            // Simulates temporarily changing a value to check constraints
            wouldBeValidWithChange(groupName: string, input: HTMLInputElement, newValue: number): ValidationResult {
                const originalValue = input.value;
                input.value = newValue.toString();

                // Check if at least one counter would still have a positive value
                const hasNonZero = this.hasNonZeroValue(groupName);

                // Get the group's maximum constraint from data attribute
                const groupMax = Number(input.dataset.groupMax);

                // Check if sum would exceed the group maximum
                const sum = this.getSum(groupName);
                const underMax = groupMax ? sum <= groupMax : true;

                // Restore the original value
                input.value = originalValue;

                if (!hasNonZero) {
                    return {
                        isValid: false,
                        message: `MIN SUM`,
                        groupMessage: `I can't really sell <span class="b7">nothing</span>, can I?`,
                        direction: "down"
                    };
                }

                if (!underMax) {
                    return {
                        isValid: false,
                        message: `MAX SUM: ${groupMax}`,
                        groupMessage: `Can only do <span class="b7">${groupMax}</span> for now... sorry!`,
                        direction: "up"
                    };
                }

                return { isValid: true };
            }
        };

        // UI feedback functions
        const uiFeedback = {
            showGroupError(message?: string) {
                if (!qcErrGroup) return;

                qcErrGroup.innerHTML = message || '';
                qcErrGroup.classList.add("qcErring");
            },

            clearGroupError() {
                if (!qcErrGroup) return;

                qcErrGroup.classList.remove("qcErring");
            },

            showInputError(errorElement: HTMLElement, message: string = '') {
                if (!errorElement) return;

                errorElement.style.display = "block";
                errorElement.innerHTML = message;
            },

            clearInputError(errorElement: HTMLElement) {
                if (!errorElement) return;

                errorElement.style.display = "none";
            },

            animateController(controller: HTMLElement, direction?: string) {
                if (!controller || !direction) return;

                const className = direction === "up" ? "controllerNudgeUp" : "controllerNudgeDown";

                controller.classList.add(className);
                setTimeout(() => {
                    controller.classList.remove(className);
                }, ERROR_DURATION_MS);
            }
        };

        // Set up each quantity controller
        customInputs.forEach((wrapper: Element) => {
            const input = wrapper.querySelector('.formQCounter') as HTMLInputElement;
            const decrement = wrapper.querySelector('.qcDecrement') as HTMLElement;
            const increment = wrapper.querySelector('.qcIncrement') as HTMLElement;
            const qcDispErr = wrapper.querySelector('.qcDispErr') as HTMLElement;
            const qcController = wrapper.querySelector(".qcController") as HTMLElement;

            const groupName = input.getAttribute('data-group');
            const min = parseInt(input.min) || DEFAULT_MIN;
            const max = parseInt(input.max) || DEFAULT_MAX;
            const groupMax = Number(input.dataset.groupMax);

            // Handle user feedback and validation
            const handleValidationFeedback = (result: ValidationResult) => {
                if (!result.isValid) {
                    // Show input-specific errors (MIN/MAX values)
                    if (result.message) {
                        uiFeedback.showInputError(qcDispErr, result.message);
                    }

                    // Animate the controller if direction is provided
                    uiFeedback.animateController(qcController, result.direction);

                    // Only show group errors for group-related messages
                    if (groupName && result.groupMessage) {
                        uiFeedback.showGroupError(result.groupMessage);
                    }
                    return false;
                }
                return true;
            };

            // Validate and adjust input value
            const validateValue = (value: number): ValidationResult => {
                // Basic min/max validation
                if (value < min) {
                    return {
                        isValid: false,
                        message: `MIN: ${min}`,
                        direction: "down"
                    };
                }

                if (value > max) {
                    return {
                        isValid: false,
                        message: `MAX: ${max}`,
                        direction: "up"
                    };
                }

                // Group validation if applicable
                if (groupName) {
                    // Check group constraints with the new value
                    const originalValue = input.value;
                    input.value = value.toString();

                    const groupSum = groupValidation.getSum(groupName);

                    // Restore original value
                    input.value = originalValue;

                    if (groupSum > groupMax) {
                        return {
                            isValid: false,
                            message: `MAX SUM: ${max}`,
                            groupMessage: `Can only do <span class="b7">${groupMax}</span> for now... sorry!`,
                            direction: "up"
                        };
                    }
                }

                return { isValid: true };
            };

            // Value change handler with validation and adjustment
            const handleValueChange = (newValue: number, direction?: 'up' | 'down') => {
                const result = validateValue(newValue);

                if (!result.isValid) {
                    // Handle invalid case
                    handleValidationFeedback(result);

                    // Adjust the value if needed
                    if (newValue < min) {
                        input.value = min.toString();
                    } else if (newValue > max) {
                        input.value = max.toString();
                    } else if (groupName) {
                        // Adjust for group maximum if needed
                        const groupSum = groupValidation.getSum(groupName);
                        if (groupSum > groupMax) {
                            const adjustment = groupSum - groupMax;
                            const adjustedValue = Math.max(min, newValue - adjustment);
                            input.value = adjustedValue.toString();
                        }
                    }
                } else {
                    // Valid case - set the new value
                    input.value = newValue.toString();
                    // Clear any previous errors
                    uiFeedback.clearInputError(qcDispErr);
                    qcController.classList.remove("controllerNudgeUp", "controllerNudgeDown");
                    uiFeedback.clearGroupError();

                    // Trigger price recalculation
                    if (typeof recalculatePrice === 'function') {
                        //devConsole(`[->] QC handleValueChange calls RCP`)

                        recalculatePrice();
                    }
                }
            };

            // Event: Direct input changes
            input.addEventListener('input', () => {
                const value = parseInt(input.value) || 0;
                handleValueChange(value);
            });

            // Event: When input loses focus
            input.addEventListener('blur', () => {
                let value = parseInt(input.value) || 0;

                // Basic validation and adjustment
                if (isNaN(value)) {
                    value = min;
                }

                handleValueChange(value);

                // Special case for group minimum constraint
                if (groupName && groupValidation.getSum(groupName) === 0) {
                    input.value = "1";
                    uiFeedback.showInputError(qcDispErr, "");
                    uiFeedback.showGroupError(`I can't really sell <span class="b7">nothing</span>, can I?`);
                }
            });

            function onChange() {
                // Clear errors and animations
                uiFeedback.clearGroupError();
                uiFeedback.clearInputError(qcDispErr);
                qcController.classList.remove("controllerNudgeUp", "controllerNudgeDown");

                // Trigger price recalculation
                if (typeof recalculatePrice === 'function') {
                    //devConsole(`[->] onChange calls RCP`)

                    recalculatePrice();
                }
            }

            function incrementUp() {
                const value = parseInt(input.value) || 0;

                // Check if incrementing would violate group max
                if (groupName) {
                    const currentGroupSum = groupValidation.getSum(groupName);
                    if (currentGroupSum >= groupMax) {
                        handleValidationFeedback({
                            isValid: false,
                            message: `MAX SUM: ${max}`,
                            groupMessage: `Can only do <span class="b7">${groupMax} sketches</span> in <span class="b7">total</span> for now... sorry!`,
                            direction: "up"
                        });
                        return;
                    }
                }

                handleValueChange(value + 1, "up");
            }
            function decrementDown() {
                const value = parseInt(input.value) || 0;

                // Special case: Check if decrementing would violate group constraints
                if (value === 1 && groupName) {
                    const validationResult = groupValidation.wouldBeValidWithChange(groupName, input, 0);
                    if (!validationResult.isValid) {
                        handleValidationFeedback(validationResult);
                        return;
                    }
                }
                handleValueChange(value - 1, "down");
            }

            // Event: On input change complete
            input.addEventListener('change', onChange);

            // Event: Decrement button clicked
            decrement?.addEventListener('click', decrementDown);

            // Event: Increment button clicked
            increment?.addEventListener('click', incrementUp);
        });
    }

    function assignRadioListeners() {
        //const key = `assignRadioListeners-${lookupConfigId}`;
        //if (initialized.has(key)) return;
        document.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener("change", updateConditionalOptions);
            //devConsole('eventListener on radios');
        });
        //initialized.add(key);
    }

    function initList() {
        //every navigation, lmao
        initbackButton();
        configStateSlotIsFullCheck();
        setupFormValidation();
        updateConditionalOptions();
        initConfigControl();
        initPseudoSubmit();
        summaryDisplayControl("", {});
        quantityController();
        initDz();
        assignRadioListeners();
        initSummaryButtons();
        initPriceCalc();
    }

    // rehydraters
    //document.addEventListener("DOMContentLoaded", initList);
    initList();    //initList();
}

