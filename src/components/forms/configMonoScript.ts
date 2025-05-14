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
                            //this.on("error", function (this: Dropzone, file) {
                            //  this.removeFile(file);
                            //  dzElem.classList.add("errNudge");
                            //  fileTypeSpan?.classList.add("errCulprit");
                            //});
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
        // Find all conditional options
        document.querySelectorAll(".conditionalOpt").forEach((elem) => {
            const elAsHTML = elem as HTMLElement;
            const visibleIf = elAsHTML.getAttribute("data-visible-if") as string;
            if (!visibleIf) return;
            try {
                const cond = JSON.parse(visibleIf);
                // Find the radio group for the controlling question
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
                    // Optionally, uncheck if hidden
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

        // Track already validated fields to avoid duplicate error messages
        const validatedFields = new Set();

        // Check if an error container already exists, otherwise create one
        let errorContainer = configForm.querySelector(".formInvalidErr");
        if (!errorContainer) {
            errorContainer = document.createElement("div");
            errorContainer.className = "formInvalidErr";
            configForm.insertBefore(errorContainer, checkPulse);
        }

        return {
            validate: (event: Event) => {
                // Clear previous error messages
                errorContainer.innerHTML = "";
                let hasErrors = false;

                // Find all required radio button groups
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

                // Check each radio group
                Object.entries(radioGroups).forEach(([name, radios]) => {
                    // Check if any radio in this group is checked
                    const isChecked = radios.some((radio) => radio.checked);

                    if (!isChecked) {
                        hasErrors = true;

                        // Find section name for better error message
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

                        // Add error message
                        const errorMsg = document.createElement("div");
                        errorMsg.innerHTML = `Nothing is selected in <span class="b7">${sectionName}</span> !`;
                        errorMsg.className = "errBlob";
                        errorContainer.appendChild(errorMsg);

                        // Scroll to the first error
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

                // If we get here, all required fields are valid
                // Collect data only after successful validation
                const formData = new FormData(configForm);

                // Return both the processed data object and the form data
                return { isValid: true, formData };
            },
        };
    }

    function collector(configFormElem?: HTMLFormElement) {
        /** @type {Record<string, string | File | File[]>} */

        const data: Record<string, string | number | File | File[]> = {};
        const formData = new FormData(configFormElem);

        setupFormValidation();

        // Get cardData from wherever it's defined in your component
        // For example, it might be passed as a prop or defined in the script

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

        // Add the card ID to the data and formData
        data.cardId = lookupConfigId;
        formData.append("type", lookupConfigId);

        //console.log("Collected config data:", data);

        // Return both the processed data object and the FormData
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

        //reminder: HI HELLO THE ORIGINAL BUTTON IS NO LONGER SUBMIT TYPE
        proceedBtn.addEventListener("click", function (event) {
            //configForm.addEventListener("submit", async (event: Event) => {

            const { validate } = setupFormValidation();
            const result = validate(event);
            if (!result.isValid) {
                event.preventDefault();
                return;
            }

            // Now we can safely collect the data
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
        console.log(formData)
        // Clear existing content
        targetElement.innerHTML = "";

        // Define which keys to display and their display names
        const keysToDisplay = {
            character_detail: "Character Detail",
            anthro: "Anthro?",
            background: "Background Art",
            nsfw: "NSFW?",
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

        // Add price if available
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
            //console.log(`Ready as` + formData);
        }

        switch (mode) {
            case "open":
                summaryDisplayControl("reset", {});

                // Generate summary content if appendedFormData is provided
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

                    // Submit to Cloudflare Worker - use the formData we got above
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

                                    // Give the browser a moment to navigate back
                                    setTimeout(() => {
                                        // If we're still on the same page after trying to go back
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

        // Add fresh event listeners
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
            cardData.configData.forEach((config) => {
                if (config.type === "singleChoice" || config.type === "flipflop") {
                    totalAdd += getSelectedOptionPrice(config, configForm);
                }
                if (config.type === "quantityCounter") {
                    const input = document.getElementById(config.id) as HTMLInputElement;
                    const quantity = parseInt(input.value) || 0;
                    totalAdd += quantity * (config.perPrice || 0);
                }
            });
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

        //simple check if it exists, so it doesn't throw errors all day.
        if (!customInputs) {
            return;
        }

        // Function to check if at least one counter in a group has value > 0
        function checkGroupConstraint(groupName: string): boolean {
            const groupInputs: NodeListOf<Element> = document.querySelectorAll(`input[data-group="${groupName}"]`);
            let hasValueGreaterThanZero: boolean = false;

            groupInputs.forEach((input: Element) => {
                if (parseInt((input as HTMLInputElement).value) > 0) {
                    hasValueGreaterThanZero = true;
                }
            });

            return hasValueGreaterThanZero;
        }

        // Function to get the sum of all counters in a group
        function getGroupSum(groupName: string): number {
            const groupInputs: NodeListOf<Element> = document.querySelectorAll(`input[data-group="${groupName}"]`);
            let sum: number = 0;

            groupInputs.forEach((input: Element) => {
                sum += parseInt((input as HTMLInputElement).value) || 0;
            });

            return sum;
        }

        // Function to check if the group sum exceeds the maximum allowed
        function checkGroupMaxConstraint(groupName: string, maxSum: number = 5): boolean {
            return getGroupSum(groupName) <= maxSum;
        }

        // Function to show group validation message
        function showGroupValidationError(message?: string) {
            qcErrGroup.innerHTML = message ?? '';
            qcErrGroup.classList.add("qcErring")
        }

        customInputs.forEach((wrapper: Element) => {
            const input = wrapper.querySelector('.formQCounter') as HTMLInputElement;
            const numDisp = wrapper.querySelector(".numpDisp") as HTMLElement;
            const decrement = wrapper.querySelector('.qcDecrement') as HTMLElement;
            const increment = wrapper.querySelector('.qcIncrement') as HTMLElement;
            const qcDispErr = wrapper.querySelector('.qcDispErr') as HTMLElement;
            const groupName: string | null = input.getAttribute('data-group');

            const qcController = wrapper.querySelector(".qcController") as HTMLElement;

            const min: number = parseInt(input.min) || 0;
            const max: number = parseInt(input.max) || 1;
            const GROUP_MAX_SUM: number = Number(input.dataset.groupMax); // Maximum allowed sum for the group

            // Function to show validation feedback
            function showValidationError(message?: string, direction?: string) {
                qcDispErr.style.display = "block";
                qcDispErr.innerHTML = message ?? '';
                if (direction === "up") {
                    qcController.classList.add("controllerNudgeUp")
                    setTimeout(() => {
                        qcController.classList.remove("controllerNudgeUp")
                    }, 201);
                } else if (direction === "down") {
                    qcController.classList.add("controllerNudgeDown")
                    setTimeout(() => {
                        qcController.classList.remove("controllerNudgeDown")
                    }, 201);
                }
            }

            // Handle input changes (typed value)
            input.addEventListener('input', () => {
                const value: number = parseInt(input.value) || 0;

                if (value < min) {
                    showValidationError(`MIN: ${min}`, "down");
                    // Immediately reset to min
                    input.value = min.toString();
                } else if (value > max) {
                    showValidationError(`MAX: ${max}`, "up");
                    // Immediately reset to max
                    input.value = max.toString();
                } else if (groupName) {
                    // Check if the new value would make the group sum exceed the maximum

                    // Store original value to restore if needed
                    const originalValue: string = input.value;
                    // Get the current value before input
                    const currentValue: number = parseInt(originalValue) || 0;

                    // Calculate group sum with the new value
                    const currentGroupSum: number = getGroupSum(groupName);

                    // If this would exceed the group max, revert and show error
                    if (currentGroupSum > GROUP_MAX_SUM) {
                        // Reset to a value that would make the sum equal to GROUP_MAX_SUM
                        const allowedValue: number = Math.max(0, value - (currentGroupSum - GROUP_MAX_SUM));
                        input.value = allowedValue.toString();

                        showGroupValidationError(`Can only do <span class="b7">${GROUP_MAX_SUM}</span> doodles for now... sorry!`);
                        showValidationError(``, "up");
                    }
                }
            });

            // Add a change event listener to handle price recalculation
            input.addEventListener('change', () => {
                // Call your price recalculation function here
                recalculatePrice();
                qcErrGroup.classList.remove("qcErring")
                qcDispErr.style.display = "none";
                qcController.classList.remove("controllerNudgeUp")
                qcController.classList.remove("controllerNudgeDown")
            });

            // Handle decrement button
            decrement?.addEventListener('click', () => {
                const value: number = parseInt(input.value) || 0;

                if (value <= min) {
                    showValidationError(`MIN: ${min}`, "down");
                } else {
                    // Special case: If this is the last counter with value > 0, don't allow decrementing to 0
                    if (value === 1 && groupName) {
                        // Create a temporary copy of the current value
                        const originalValue: string = input.value;
                        // Temporarily set to 0 to check if other counters have values > 0
                        input.value = "0";

                        const isGroupValid: boolean = checkGroupConstraint(groupName);

                        if (!isGroupValid) {
                            // Reset to original value
                            input.value = originalValue;
                            showValidationError(``, "down");
                            showGroupValidationError(`I can't really sell <span class="b7">nothing</span>, can I?`);
                            return;
                        } else {
                            // It's safe to decrement
                            input.value = (value - 1).toString();
                        }
                    } else {
                        // Normal decrement
                        input.value = (value - 1).toString();
                    }
                    input.dispatchEvent(new Event('change'));
                }
            });

            // Handle increment button
            increment?.addEventListener('click', () => {
                const value: number = parseInt(input.value) || 0;

                if (value >= max) {
                    showValidationError(`MAX: ${max}`, "up");
                } else {
                    // Check if incrementing would exceed the group maximum (if this input is part of a group)
                    if (groupName) {
                        const currentGroupSum: number = getGroupSum(groupName);

                        if (currentGroupSum >= GROUP_MAX_SUM) {
                            showGroupValidationError(`Can only do <span class="b7">${GROUP_MAX_SUM} sketches</span> in <span class="b7">total</span> for now... sorry!`);
                            showValidationError(``, "up");
                            return;
                        }
                    }

                    input.value = (value + 1).toString();
                    input.dispatchEvent(new Event('change'));
                }
            });

            // Additional validation on blur (when user clicks away)
            input.addEventListener('blur', () => {
                let value: number = parseInt(input.value) || 0;

                if (isNaN(value)) {
                    input.value = min.toString();
                } else if (value < min) {
                    input.value = min.toString();
                } else if (value > max) {
                    input.value = max.toString();
                } else if (groupName) {
                    // Final check for group maximum
                    const currentGroupSum: number = getGroupSum(groupName);

                    if (currentGroupSum > GROUP_MAX_SUM) {
                        // Adjust this input to comply with the group maximum
                        const adjustment: number = currentGroupSum - GROUP_MAX_SUM;
                        const newValue: number = Math.max(min, value - adjustment);
                        input.value = newValue.toString();

                        showValidationError(``, "up");
                        showGroupValidationError(`Can only do <span class="b7">${GROUP_MAX_SUM} sketches</span> in <span class="b7">total</span> for now... sorry!`);

                    }

                    // Also check minimum constraint (at least one > 0)
                    if (value === 0 && currentGroupSum === 0) {
                        input.value = "1";
                        showValidationError(``, "down");
                        showGroupValidationError(`I can't really sell <span class="b7">nothing</span>, can I?`);
                    }
                }

                // Also trigger price recalculation on blur
                recalculatePrice();
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
    //document.addEventListener("DOMContentLoaded", initList);
    document.addEventListener("astro:page-load", initList);
}