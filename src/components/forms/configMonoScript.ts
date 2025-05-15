import Dropzone from "dropzone";
import { navigate } from "astro:transitions/client";
import { type CardData } from "../../data/cardData";


export default function initConfigPageLogic(cardData: CardData, lookupConfigId: string) {

    function initDz() {
        const dzConfigFileSize: number = 19.0735;

        cardData.configData?.forEach((config) => {
            if (config.type === "fileUpload") {
                const dzElem = document.getElementById(`dropZone_${config.id}`);
                const validityInfo = document.querySelector(".validFileInfo");
                const fileTypeSpan = document.getElementById("errReason-fileType");
                const fileSizeSpan = document.getElementById("errReason-fileSize");
                const fileCountSpan = document.getElementById("errReason-fileCount");
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
    }

    function updateConditionalOptions() {
        //searcha all
        document.querySelectorAll(".conditionalOpt").forEach((elem) => {
            const elAsHTML = elem as HTMLElement;
            const visibleIf = elAsHTML.getAttribute("data-visible-if") as string;
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
                    elAsHTML.style.display = "";
                } else {
                    elAsHTML.style.display = "none";
                    //failsafe, nullify precheck if hidden
                    const input = elAsHTML.querySelector('input[type="radio"]');
                    if (input) (input as HTMLInputElement).checked = false;
                }
            } catch (e) { }
        });
    }
    updateConditionalOptions();

    function setupFormValidation() {
        const configForm = document.getElementById(
            "configWindow"
        ) as HTMLFormElement;
        const checkPulse = document.getElementById(
            "proceedBtn"
        ) as HTMLButtonElement;

        //mini mem for err list
        const validatedFields = new Set();

        let errorContainer = configForm.querySelector(".formInvalidErr");
        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.className = "formInvalidErr";
            configForm.insertBefore(errorContainer, checkPulse);
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

        const data: Record<string, string | number | File | File[]> = {};
        const formData = new FormData(configFormElem);

        setupFormValidation();

        // Collect all normal fields
        if (cardData.configData) {
            for (const field of cardData.configData) {
                const value = formData.getAll(field.id);
                if (value.length > 1) {
                    data[field.id] = value.filter((v) => v instanceof File);
                } else if (value[0] instanceof File) {
                    data[field.id] = value[0];
                } else if (value[0] != null) {
                    data[field.id] = value[0].toString();
                }
            }
        }

        // Collect files from Dropzone instances
        cardData.configData?.forEach((config) => {
            if (config.type === "fileUpload") {
                const dzElem = document.getElementById(`dropZone_${config.id}`);
                if (dzElem && dzElem.dropzone) {
                    const dzFiles = dzElem.dropzone.getAcceptedFiles();
                    if (dzFiles.length > 0) {
                        dzFiles.forEach((file) => {
                            formData.append(config.id, file, file.name);
                        });
                        data[config.id] = dzFiles.length === 1 ? dzFiles[0] : dzFiles;
                    }
                }
            }
        });

        data.calculatedPrice = priceAdd;
        formData.append("estPrice", priceAdd.toString());

        data.cardId = lookupConfigId;
        formData.append("type", lookupConfigId);

        //console.log("Collected config data:", data);

        return { data, formData };
    }

    function initPseudoSubmit() {
        // FORM PACKAGING
        const configForm = document.getElementById(
            "configWindow"
        ) as HTMLFormElement;
        const proceedBtn = document.getElementById(
            "proceedBtn"
        ) as HTMLButtonElement;

        proceedBtn.addEventListener("click", function (event) {

            const { validate } = setupFormValidation();
            const result = validate(event);
            if (!result.isValid) {
                event.preventDefault();
                return;
            }

            //collect
            const { data } = collector(configForm);

            summaryDisplayControl("open", data);
        });
    }
    //summaryDisplayControl("open");

    function generateSummary(
        formData: Record<string, string | number | File | File[]>,
        targetElement: HTMLElement
    ) {
        // Safety check for formData
        if (!formData || typeof formData !== "object") {
            console.error("Invalid form data provided to generateSummary");
            return;
        }
        //console.log(formData)

        //reset
        targetElement.innerHTML = "";

        const keysToDisplay = {
            character_detail: "Character Detail",
            anthro: "Anthro?",
            background: "Background Art",
            nsfw: "NSFW?",
            character_count: "Character Count",
            sketch_quantity: "Sketch Quantity",
            color_quantity: "Colored Sketch Quantity",
            request_text: "Request",
            contacts: "Contact Information",
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

        //pull estPrice
        if (formData["calculatedPrice"]) {
            const fragment = createSummaryFragment(
                "Estimated Price",
                `€${formData["calculatedPrice"]}`
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

    function summaryDisplayControl(
        mode: string | null,
        appendedFormData: Record<string, string | number | File | File[]> | null
    ) {
        console.log("summaryDisplayControl:", mode);

        const startButton = document.getElementById("startConfig") as HTMLElement;

        const summaryWindow = document.getElementById(
            "configSummary"
        ) as HTMLElement;
        const summaryButtons = document.getElementById(
            "confirmButtons"
        ) as HTMLElement;
        const summaryHeading = document.getElementById(
            "confirmText"
        ) as HTMLElement;
        const summaryGrid = document.getElementById(
            "pickedConfigGrid"
        ) as HTMLElement;
        const loadAnim = document.getElementById("loadAnim") as HTMLElement;
        const loadBar = document.getElementById("gradbar") as HTMLElement;
        const loadString = document.getElementById("loadStatString") as HTMLElement;

        const configForm = document.getElementById(
            "configWindow"
        ) as HTMLFormElement;

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
                summaryButtons.style.transform = "translateY(2em)";
                loadString.innerHTML = "Sending...";
                loadBar.classList.remove("loadOK");
                loadBar.classList.remove("loadErr");

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
                                    const currentPage = window.location.href;

                                    window.history.back();

                                    setTimeout(() => {
                                        if (window.location.href === currentPage) {
                                            navigate("commission/");
                                        }
                                    }, 100);
                                }, 500);
                            }, 2000);
                            startButton.classList.add("disabled");
                        } else {
                            loadBar.classList.add("loadErr");
                            loadString.innerHTML = `fail: ${error ?? "unknown error"}`;
                            setTimeout(() => summaryDisplayControl("close", {}), 2000);
                        }
                    });
                }, 300);
                break;
            case "reset":
                loadAnim.style.display = "none";
                summaryHeading.style.opacity = "1";
                summaryButtons.style.opacity = "1";
                summaryButtons.style.transform = "";
                summaryGrid.style.opacity = "1";
                summaryButtons.style.pointerEvents = "auto"
                break;
            default:
                break;
        }
    }

    function initSummaryButtons() {
        const goBack = document.getElementById(
            "summary-cancelConfirm"
        ) as HTMLElement;
        const iAmSure = document.getElementById("summary-proceed") as HTMLElement;

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
        (oldIAmSure as HTMLElement).addEventListener("click", () =>
            summaryDisplayControl("proceed", {})
        );
    }

    type SubmissionResult = {
        success: boolean;
        error?: string;
    };
    async function submitFormToWorker(
        formData: FormData | null
    ): Promise<SubmissionResult> {
        const WORKER_URL = "https://pottocomm-collector.pottoart.workers.dev/";
        //const WORKER_URL = "https://no.pottoart.workers.dev/"; //disable for now

        if (cardData.isDisabled) {
            const disMsg: string =
                "supposedly your submission is already on the way, but this one is not available right now. Appreciate your effort for bruteforcing your way here though.";
            alert(disMsg);
            return {
                success: false,
                error: disMsg,
            };
        }

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                const msg = `Server responded with ${response.status}`;
                throw new Error(msg);
            }

            const result = await response.json();
            console.log("Submission successful:", result);
            return { success: true };
        } catch (err: unknown) {
            console.error("failure sending:", err);
            return {
                success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }

    let priceAdd: number = 0;

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
    }

    let lastPrice = cardData.price;

    function updatePrice() {
        const priceElem = document.getElementById("priceCalc");
        if (priceElem) {
            //const newPrice = cardData.price + priceAdd;
            const newPrice = 0 + priceAdd;
            animateNumber(priceElem, lastPrice, newPrice, 400);
            lastPrice = newPrice;
        }
    }

    function getSelectedOptionPrice(
        config: {
            id: string;
            options?: { optionName: string; optionPrice: number }[];
        },
        form: HTMLElement
    ) {
        if (!config.options) return 0;
        // For radio/flipflop, find the checked input
        const selected = form.querySelector(`input[name="${config.id}"]:checked`);
        if (!selected) return 0;
        const selectedValue = (selected as HTMLInputElement).value;
        const found = config.options.find(
            (opt) => opt.optionName === selectedValue
        );
        return found ? found.optionPrice : 0;
    }


    function recalculatePrice() {
        const configForm = document.getElementById("configWindow");
        let totalAdd = 0;

        if (cardData.configData && configForm) {
            // Get all configs first
            const detailConfig = cardData.configData.find(config => config.id === "character_detail");
            const characterDetailPrice = detailConfig ? getSelectedOptionPrice(detailConfig, configForm) : 0;
            const characterCountConfig = cardData.configData.find(config => config.type === "characterCount");

            // Process each config for price calculation
            cardData.configData.forEach((config) => {
                // Only process singleChoice/flipflop if it's NOT the character_detail
                // This prevents double counting the base price
                if ((config.type === "singleChoice" || config.type === "flipflop") &&
                    config.id !== "character_detail") {
                    totalAdd += getSelectedOptionPrice(config, configForm);
                }
                else if (config.type === "quantityCounter") {
                    const input = document.getElementById(config.id) as HTMLInputElement;
                    const quantity = parseInt(input.value) || 0;
                    totalAdd += quantity * (config.perPrice || 0);
                }
            });

            // Handle character_detail and characterCount together to avoid double counting
            if (characterCountConfig) {
                const input = document.getElementById(characterCountConfig.id) as HTMLInputElement;
                const count = parseInt(input.value) || 0;

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

        priceAdd = totalAdd;
        updatePrice();
    }

    function initPriceCalc() {
        const configForm = document.getElementById("configWindow");
        if (configForm) {
            configForm.addEventListener("change", recalculatePrice);
        }
        recalculatePrice();
    }

    function initbackButton() {
        const back = document.getElementById("backB") as HTMLElement;
        back.addEventListener("click", () => {
            //navigate("/");
            const currentPage = window.location.href;

            window.history.back();

            // Give the browser a moment to navigate back
            setTimeout(() => {
                // If we're still on the same page after trying to go back
                if (window.location.href === currentPage) {
                    navigate("commission/");
                }
            }, 100);
        });
    }

    function configDisplayControl(command: boolean) {
        const infoBox = document.getElementById("infobox") as HTMLElement;
        const configWindow = document.getElementById("configWindow") as HTMLElement;
        const configStatus = document.getElementById("configStatus") as HTMLElement;
        const cardBody = document.querySelector(".cardBody") as HTMLElement;
        const imgGrid = document.querySelector(".imgGrid") as HTMLElement;
        const startButton = document.getElementById("startConfig") as HTMLElement;

        switch (command) {
            case true:
                infoBox.classList.add("animExit");
                setTimeout(() => {
                    infoBox.style.display = "none";
                    infoBox.classList.remove("animExit");
                    startButton.classList.add("configGo");
                    cardBody.classList.add("configuring");
                    imgGrid.classList.add("configuring");
                    configStatus.classList.add("active");
                    configWindow.classList.add("animEnter");
                    configWindow.style.display = "block";
                    setTimeout(() => {
                        configWindow.classList.remove("animEnter");
                        infoBox.classList.remove("animExit");
                    }, 1);
                }, 300);
                break;
            case false:
                configWindow.classList.add("animExit");
                setTimeout(() => {
                    configWindow.style.display = "none";
                    startButton.classList.remove("configGo");
                    cardBody.classList.remove("configuring");
                    imgGrid.classList.remove("configuring");
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

        //skip
        //configDisplayControl(true);

        startButton.addEventListener("click", () => {
            configDisplayControl(true);
        });
        close.addEventListener("click", () => {
            configDisplayControl(false);
        });
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

            // Event: On input change complete
            input.addEventListener('change', () => {
                // Clear errors and animations
                uiFeedback.clearGroupError();
                uiFeedback.clearInputError(qcDispErr);
                qcController.classList.remove("controllerNudgeUp", "controllerNudgeDown");

                // Trigger price recalculation
                if (typeof recalculatePrice === 'function') {
                    recalculatePrice();
                }
            });

            // Event: Decrement button clicked
            decrement?.addEventListener('click', () => {
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
            });

            // Event: Increment button clicked
            increment?.addEventListener('click', () => {
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
            });
        });
    }

    function initList() {
        updatePrice();
        initbackButton();
        initPriceCalc();
        setupFormValidation();
        updateConditionalOptions();
        document.querySelectorAll('input[type="radio"]').forEach((input) => {
            input.addEventListener("change", updateConditionalOptions);
        });
        initDz();
        initConfigControl();
        initPseudoSubmit();
        // Initialize summary buttons only once
        initSummaryButtons();
        //collector();
        summaryDisplayControl("", {});
        quantityController();
    }

    // rehydraters
    document.addEventListener("DOMContentLoaded", initList);
    document.addEventListener("astro:page-load", initList);
}