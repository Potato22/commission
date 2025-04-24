fish

##### todo: deploy astro shite (pretty much vite)

    ```html
    <!-- filepath: src/layouts/configurator.astro -->
    <div id="configModal" class="modal hidden">
        <div class="modal-content">
            <button id="closeModal">Close</button>
            <div id="configContent">
                <!-- Configuration options for the selected card will be injected here -->
                 </div>
                 </div>
                 </div>

    <script>
    function openConfig(cardId) {
        // Use cardId to load dynamic content; for now we just display the identifier
        // const configContent = document.getElementById('configContent');
        // configContent.textContent = Configure ${cardId};
        // document.getElementById('configModal').classList.remove('hidden');
        }

      document.getElementById('closeModal').addEventListener("click", () => {
        document.getElementById('configModal').classList.add('hidden');
        });
    </script>

    <style>
    .modal {
        position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    }
    .hidden {
        display: none;
    }
    .modal-content {
    background: var(--base);
    padding: 2rem;
    border-radius: 10px;
    min-width: 300px;
    }
    </style>
    ```

Then in your TypeCards.astro, update the configuration button click handler to call this function with the cardId (instead of using an alert):

    ```js
    // In your existing configureButton click handler:     document.querySelectorAll(".configureButton").forEach((button) => {       if (button instanceof HTMLElement) {         button.addEventListener("click", (e) => {           // Prevent card click event from triggering           e.stopPropagation();           openConfig(button.id);         });       }     });
    ```
