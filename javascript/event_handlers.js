/////////////////////////////
// 1. Initialization Variables
/////////////////////////////

var rsen_init = false;

// Icon
var rsen_extra_networks_symbol = '🎴';

// Keep track of toggle state
var rsen_toggleState = false;

var rsen_lastTxt2imgTabButton;
var rsen_lastImg2imgTabButton;

var rsen_lastGenerationTabGridTemplateTxt2img = {
  saved: "1fr 16px 1fr"
};

var rsen_lastGenerationTabGridTemplateImg2img = {
  saved: "1fr 16px 1fr"
};

/////////////////////////////
// 1.1 Settings Helper Functions
/////////////////////////////

/**
 * Get the initial panel width from settings
 * @returns {number} Width percentage (default: 60)
 */
function rsen_getInitialPanelWidth() {
  return opts.extra_networks_side_panel_initial_width || 60;
}

/**
 * Get the card size setting and return corresponding CSS class
 * @returns {string} CSS class for card size
 */
function rsen_getCardSizeClass() {
  const cardSize = opts.extra_networks_side_panel_card_size || 'Medium';
  const sizeMap = {
    'Small': 'rsen-card-small',
    'Medium': 'rsen-card-medium',
    'Large': 'rsen-card-large',
    'Extra Large': 'rsen-card-xlarge'
  };
  return sizeMap[cardSize] || 'rsen-card-medium';
}

/**
 * Apply card size setting to the side panel
 * @param {HTMLElement} allTabs - The side panel element
 */
function rsen_applyCardSize(allTabs) {
  if (!allTabs) return;

  // Remove all card size classes
  allTabs.classList.remove('rsen-card-small', 'rsen-card-medium', 'rsen-card-large', 'rsen-card-xlarge');

  // Add the current card size class
  const cardSizeClass = rsen_getCardSizeClass();
  allTabs.classList.add(cardSizeClass);
}

/////////////////////////////
//2. UI Initialization Function
/////////////////////////////

// This function is automatically called by automatic1111 when the UI is loaded
onUiLoaded(function() {
  // This code should only be run once, so if init is true dont do anything. Init is set after we complete this the first time.
  if(!rsen_init) {
    // Get all the elements you are interested in and put them into an object to make the later code a bit cleaner
    let settingsObjects = [
      { // Text2Image elements
        tools: document.getElementById('txt2img_tools'),
        last_button:  document.getElementById('txt2img_style_apply'),
        generation_tab: document.getElementById('txt2img_settings') ? document.getElementById('txt2img_settings').parentNode.parentNode : null,
        generation_tab_att_id: 'txt2img_generation_tab',
        new_id: 'txt2img_toggle_extra'
      },
      { // Image2Image elements
        tools: document.getElementById('img2img_tools'),
        last_button:  document.getElementById('deepbooru'),
        generation_tab: document.getElementById('img2img_settings') ? document.getElementById('img2img_settings').parentNode.parentNode : null,
        generation_tab_att_id: 'img2img_generation_tab',
        new_id: 'img2img_toggle_extra'
      }
    ];
    if(settingsObjects[0].tools && settingsObjects[1].tools && typeof settingsObjects[0].last_button != "undefined" && typeof settingsObjects[1].last_button != "undefined") {
      // Loop through each object in the array we created earlier
      settingsObjects.forEach(obj => {
        // Do init code
        if (obj.last_button) {
            let newButton = obj.last_button.cloneNode(false); // Duplicate the last_button
            newButton.id = obj.new_id; // Change the id to new_id
            newButton.title = "Toggle Extra Networks."; // Change the title
            newButton.innerHTML = rsen_extra_networks_symbol; // Change the innerHTML

            obj.last_button.parentNode.insertBefore(newButton, obj.last_button.nextSibling); // Insert the new button after the last_button

            newButton.onclick = () => rsen_toggleExtraNetworks(); // Add new click event
        }

        // Set an id for the inner generation tab div and parent div
        if (obj.generation_tab) {
            obj.generation_tab.setAttribute("sd-enr-id", obj.generation_tab_att_id);
            obj.generation_tab.parentNode.setAttribute("sd-enr-id", obj.generation_tab_att_id + "_parent");
        }
      });
      
      // Now that we are done, set init to true so that it doesn't run more than once
      rsen_init = true;
    }
  }
});

/////////////////////////////
//3. Helper Functions
/////////////////////////////
function getText_ExtraNetworksSidePanel(text) {
  let tl = getTranslation(text);
  return tl !== undefined ? tl.trim() : text.trim();
}

// Add this function to force full width on all elements
function forceFullWidth() {
  // Get all elements with class or ID containing 'container', 'wrapper', 'content'
  const elements = document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="content"], [id*="container"], [id*="wrapper"], [id*="content"]');
  
  elements.forEach(el => {
      el.style.maxWidth = '100%';
      el.style.width = '100%';
  });
  
  // Also target the main tabs
  document.querySelectorAll('#tabs, #tab_txt2img, #tab_img2img').forEach(tab => {
      tab.style.maxWidth = '100%';
      tab.style.width = '100%';
  });
}


/////////////////////////////
//4. Toggle Extra Networks Function (Part 1 - Setup)
/////////////////////////////
function rsen_toggleExtraNetworks() {
  
  // Helper to ensure elements are found and attributes are restored if lost (e.g. due to re-renders)
  const getTabElements = (tabName) => {
      let genTab = document.querySelector(`[sd-enr-id="${tabName}_generation_tab"]`);
      let genTabParent = document.querySelector(`[sd-enr-id="${tabName}_generation_tab_parent"]`);
      
      if (!genTab) {
          const settings = document.getElementById(`${tabName}_settings`);
          if (settings) {
              genTab = settings.parentNode.parentNode;
              // Restore attribute if we recovered the element
              if (genTab) genTab.setAttribute("sd-enr-id", `${tabName}_generation_tab`);
          }
      }
      
      if (!genTabParent && genTab) {
          genTabParent = genTab.parentNode;
          // Restore attribute if we recovered the element
          if (genTabParent) genTabParent.setAttribute("sd-enr-id", `${tabName}_generation_tab_parent`);
      }
      
      return { genTab, genTabParent };
  };

  const txt2imgEls = getTabElements('txt2img');
  const img2imgEls = getTabElements('img2img');

  // Get all the elements you are interested in and put them into an object to make the later code a bit cleaner
  let settingsObjects = [
    { // Text2Image elements
      all_tabs: document.getElementById('txt2img_extra_tabs'),
      generation_tab_parent: txt2imgEls.genTabParent,
      generation_tab: txt2imgEls.genTab,
      generation_tab_resize: document.getElementById('txt2img_generation_tab_resize'),
      generation_tab_resize_id: 'txt2img_generation_tab_resize',
      tab_nav: document.querySelector('#txt2img_extra_tabs > .tab-nav'),
      lastTabButton: rsen_lastTxt2imgTabButton,
      lastGridTemplate: rsen_lastGenerationTabGridTemplateTxt2img,
      toprow: document.getElementById('txt2img_toprow')
    },
    { // Image2Image elements
      all_tabs: document.getElementById('img2img_extra_tabs'),
      generation_tab_parent: img2imgEls.genTabParent,
      generation_tab: img2imgEls.genTab,
      generation_tab_resize: document.getElementById('img2img_generation_tab_resize'),
      generation_tab_resize_id: 'img2img_generation_tab_resize',
      tab_nav: document.querySelector('#img2img_extra_tabs > .tab-nav'),
      lastTabButton: rsen_lastImg2imgTabButton,
      lastGridTemplate: rsen_lastGenerationTabGridTemplateImg2img,
      toprow: document.getElementById('img2img_toprow')
    }
  ];


/////////////////////////////
//5. Toggle Extra Networks Function (Part 2 - Width Handling)
/////////////////////////////

  // Add body attribute and adjust Forge containers based on toggle state
  if (!rsen_toggleState) {
    // Add body class for CSS targeting
    document.body.setAttribute('restore-separate-extra-network', '');
    
    // Force Forge containers to proper width
    document.querySelectorAll('.gradio-container').forEach(container => {
        container.style.width = '100%';
        container.style.maxWidth = '100%';
    });
    
    // Also ensure parent containers are full width
    document.querySelectorAll('#tab_txt2img, #tab_img2img').forEach(tab => {
        tab.style.width = '100%';
        tab.style.maxWidth = '100%';
    });
    
    // Ensure the main app container is full width
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.style.width = '100%';
        appElement.style.maxWidth = '100%';
    }
    
    // Force full width on all container elements
    forceFullWidth();
    
    // Set an interval to keep enforcing full width (some UI frameworks fight back)
    window.fullWidthInterval = setInterval(forceFullWidth, 1000);
  } else {
    // Remove body class
    document.body.removeAttribute('restore-separate-extra-network');
    
    // Reset Forge containers
    document.querySelectorAll('.gradio-container').forEach(container => {
        container.style.width = '';
        container.style.maxWidth = '';
    });
    
    // Reset parent containers
    document.querySelectorAll('#tab_txt2img, #tab_img2img').forEach(tab => {
        tab.style.width = '';
        tab.style.maxWidth = '';
    });
    
    // Reset the main app container
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.style.width = '';
        appElement.style.maxWidth = '';
    }
    
    // Clear the interval when toggling off
    if (window.fullWidthInterval) {
        clearInterval(window.fullWidthInterval);
    }
  }



/////////////////////////////
//6. Toggle Extra Networks Function (Part 3 - Tab Handling)
/////////////////////////////
if (settingsObjects[0].generation_tab && settingsObjects[1].generation_tab) {
  // Loop through each object in the array we created earlier
  settingsObjects.forEach(obj => {
    // Find the tab buttons with the text for the default tab and "Generation" tab
    if (!obj.tab_nav) return;
    
    // -- Feature: Card Size Slider --
    if (!obj.tab_nav.querySelector('.rsen-card-slider')) {
        let sliderDiv = document.createElement('div');
        sliderDiv.className = 'rsen-card-slider-group';
        
        let label = document.createElement('span');
        label.innerText = 'Card Size: ';
        label.style.fontSize = '0.85em';
        
        let slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0.1'; 
        slider.max = '1.5';
        slider.step = '0.1';
        slider.value = localStorage.getItem('rsen-card-scale') || '1.0';
        slider.className = 'rsen-card-slider';
        
        const updateCardSize = (scale) => {
            scale = parseFloat(scale);
            document.documentElement.style.setProperty('--rsen-card-width', (16 * scale) + 'rem');
            document.documentElement.style.setProperty('--rsen-card-height', (24 * scale) + 'rem');
            
            // MODIFIED: Removed font-size update to respect global settings
            localStorage.setItem('rsen-card-scale', scale);
        };
        
        slider.oninput = (e) => updateCardSize(e.target.value);
        
        // Initialize with saved or default value
        updateCardSize(slider.value);
        
        sliderDiv.appendChild(label);
        sliderDiv.appendChild(slider);
        
        // Append to nav
        obj.tab_nav.appendChild(sliderDiv);
    }
    // -- End Feature --

    let tabButtons = Array.from(obj.tab_nav.querySelectorAll('button'));
    let defaultTabButton = tabButtons.find(button => button.innerHTML.trim() === getText_ExtraNetworksSidePanel(opts.extra_networks_side_panel_default_tab));
    let generationButton = tabButtons.find(button => button.innerHTML.trim() === getText_ExtraNetworksSidePanel("Generation"));
    
    let lastTabButton;
    if (typeof obj.lastTabButton !== "undefined") {
      lastTabButton = Array.from(obj.tab_nav.querySelectorAll('button')).find(button => button.innerHTML.trim() === obj.lastTabButton.innerHTML.trim());
    }


/////////////////////////////
//7. Toggle Extra Networks Function (Part 4 - Toggle On Logic)
/////////////////////////////
if (generationButton) {
  if (!rsen_toggleState) {
    if (defaultTabButton && typeof lastTabButton === "undefined") {
      // Click the default tab button
      defaultTabButton.click();
    } else if (lastTabButton) {
      // Switch to the last tab open
      lastTabButton.click();
    }

    if (obj.all_tabs && obj.all_tabs.parentNode) {
        obj.all_tabs.parentNode.setAttribute("restore-separate-extra-network","");
        
        // Make sure the toprow stays at the top if it exists
        if (obj.toprow && obj.toprow.parentNode === obj.all_tabs.parentNode) {
          // Ensure toprow is the first child
          if (obj.all_tabs.parentNode.firstChild !== obj.toprow) {
            obj.all_tabs.parentNode.insertBefore(obj.toprow, obj.all_tabs.parentNode.firstChild);
          }
          // Style the toprow to span full width
          obj.toprow.style.width = '100%';
          obj.toprow.style.flex = '0 0 auto';
          obj.toprow.style.position = 'relative';
          obj.toprow.style.zIndex = '20';
          obj.toprow.style.marginBottom = '10px';
        }
        
        // Set up the parent container to use flexbox for proper layout
        // IMPORTANT: Parent must be relative for absolute child (sidebar) to work
        obj.all_tabs.parentNode.style.display = 'flex';
        obj.all_tabs.parentNode.style.flexDirection = 'row';
        obj.all_tabs.parentNode.style.flexWrap = 'wrap';
        obj.all_tabs.parentNode.style.alignItems = 'stretch';
        obj.all_tabs.parentNode.style.width = '100%';
        obj.all_tabs.parentNode.style.overflow = 'hidden';
        obj.all_tabs.parentNode.style.position = 'relative'; 

        // 1. First, ensure the generation tab is on the left with proper class
        // Get initial width from settings (default 60% for side panel, so generation tab gets 100% - 60% = 40%)
        const sidePanelWidth = rsen_getInitialPanelWidth();
        const generationTabWidth = 100 - sidePanelWidth;

        if (obj.generation_tab.className && !obj.generation_tab.className.includes('svelte-vt1mxs gap')) {
          obj.generation_tab.className += " svelte-vt1mxs gap";
        }
        obj.generation_tab.style.flex = '0 0 auto';
        obj.generation_tab.style.width = generationTabWidth + 'vw';
        obj.generation_tab.style.minWidth = '200px';
        obj.generation_tab.style.maxWidth = '85vw';
        obj.generation_tab.style.position = 'relative';
        obj.generation_tab.style.overflowX = 'auto';
        obj.generation_tab.style.overflowY = 'auto';
        
        // Move the generation_tab after the toprow (if it exists) or to the beginning
        if (obj.toprow) {
          obj.all_tabs.parentNode.insertBefore(obj.generation_tab, obj.toprow.nextSibling);
        } else {
          obj.all_tabs.parentNode.insertBefore(obj.generation_tab, obj.all_tabs.parentNode.firstChild);
        }

        // 2. Create the resize div for the middle
        // MODIFIED: Updated to match forge-neo's resize handle styling (styles defined in CSS)
        let resizeDiv = document.createElement('div');
        resizeDiv.setAttribute('id', obj.generation_tab_resize_id);
        // Only set essential inline styles; visual styling is handled by CSS
        resizeDiv.style.minHeight = '100%';
        resizeDiv.style.zIndex = '100'; // Higher z-index to stay above side panel

        // Insert the resize div after the generation tab
        obj.all_tabs.parentNode.insertBefore(resizeDiv, obj.generation_tab.nextSibling);

        // 3. Ensure the extra tabs are on the right
        // MODIFIED: Use Absolute Positioning to strictly match parent height (defined by Gen Tab)
        obj.all_tabs.style.position = 'absolute';
        obj.all_tabs.style.top = '0';
        obj.all_tabs.style.bottom = '0';
        // Position from left edge: generation tab width + resize bar total space (24px)
        // 24px = 4px left margin + 8px bar + 4px right margin + 8px side panel padding
        obj.all_tabs.style.left = 'calc(' + generationTabWidth + 'vw + 24px)';
        obj.all_tabs.style.right = '0';
        obj.all_tabs.style.height = '100%'; // Ensure height match

        // Width will be auto-calculated by left + right positioning
        obj.all_tabs.style.width = 'auto';

        // Apply card size setting
        rsen_applyCardSize(obj.all_tabs);

        obj.all_tabs.style.display = 'flex';
        obj.all_tabs.style.flexDirection = 'column';
        obj.all_tabs.style.visibility = 'visible';
        obj.all_tabs.style.opacity = '1';
        obj.all_tabs.style.zIndex = '10'; // Lower than resize bar (z-index: 100)
        
        // Make sure the extra tabs have the correct classes
        if (obj.all_tabs.className && !obj.all_tabs.className.includes('extra-networks')) {
          obj.all_tabs.className = 'tabs gradio-tabs extra-networks svelte-1uw5tnk';
        }

        // on mouse down (drag start)
        resizeDiv.onmousedown = function dragMouseDown(e) {
          // get position of mouse
          let dragX = e.clientX;
          // register a mouse move listener if mouse is down
          document.onmousemove = function onMouseMove(e) {
            // e.clientX will be the position of the mouse as it has moved a bit now
            let newWidth = obj.generation_tab.offsetWidth + e.clientX - dragX;
            let maxWidth = obj.all_tabs.parentNode.offsetWidth - 150;

            if (newWidth > 200 && newWidth < maxWidth) {
              // Update generation tab width
              obj.generation_tab.style.width = newWidth  + "px";

              // MODIFIED: Update sidebar left position to account for new gen tab width + resize bar spacing
              // 24px = 4px left margin + 8px bar + 4px right margin + 8px side panel padding
              obj.all_tabs.style.left = (newWidth + 24) + "px";
              // Width is auto-calculated by left + right positioning
              obj.all_tabs.style.width = 'auto';

              // update variable - till this pos, mouse movement has been handled
              dragX = e.clientX;
            }
          }
          // remove mouse-move listener on mouse-up (drag is finished now)
          document.onmouseup = () => document.onmousemove = document.onmouseup = null;
        }
    }


/////////////////////////////
//8. Toggle Extra Networks Function (Part 5 - Tab Hiding and Grid Template)
/////////////////////////////
    // Find the index of the generationButton within its parent node
    let generationButtonIndex = Array.from(obj.tab_nav.children).indexOf(generationButton) + 1;

    // Hide the "Generation" tab button
    obj.tab_nav.setAttribute("important-hide", generationButtonIndex.toString());

    // Reset the grid columns for the generation tab incase user made the columns too large
    if(obj.generation_tab.firstElementChild) {
      let tempVal = obj.generation_tab.firstElementChild.style.gridTemplateColumns;
      obj.generation_tab.firstElementChild.style.gridTemplateColumns = obj.lastGridTemplate.saved;
      obj.lastGridTemplate.saved = tempVal;
    }
  } else {
    // Show the "Generation" button
    obj.tab_nav.removeAttribute("important-hide");

    if (obj.all_tabs && obj.all_tabs.parentNode) {
        obj.all_tabs.parentNode.removeAttribute("restore-separate-extra-network","");
        
        // Reset the toprow if it exists
        if (obj.toprow) {
          obj.toprow.style.width = '';
          obj.toprow.style.flex = '';
          obj.toprow.style.position = '';
          obj.toprow.style.zIndex = '';
          obj.toprow.style.marginBottom = '';
        }
        
        // Reset the parent container layout
        obj.all_tabs.parentNode.style.display = '';
        obj.all_tabs.parentNode.style.flexDirection = '';
        obj.all_tabs.parentNode.style.flexWrap = '';
        obj.all_tabs.parentNode.style.alignItems = '';
        obj.all_tabs.parentNode.style.width = '';
        obj.all_tabs.parentNode.style.overflow = '';
        obj.all_tabs.parentNode.style.position = '';
    }

    // Reset the generation tab
    if (obj.generation_tab.className) {
        obj.generation_tab.className = obj.generation_tab.className.replace(" svelte-vt1mxs gap", "");
    }
    obj.generation_tab.style.flex = '';
    obj.generation_tab.style.width = '';
    obj.generation_tab.style.minWidth = '';
    obj.generation_tab.style.maxWidth = '';
    obj.generation_tab.style.position = '';
    obj.generation_tab.style.overflowX = '';
    obj.generation_tab.style.overflowY = '';

    // Reset the extra tabs
    obj.all_tabs.style.flex = '';
    obj.all_tabs.style.minWidth = '';
    obj.all_tabs.style.width = '';
    obj.all_tabs.style.height = '';
    obj.all_tabs.style.position = '';
    obj.all_tabs.style.top = '';
    obj.all_tabs.style.bottom = '';
    obj.all_tabs.style.left = ''; // Reset left positioning
    obj.all_tabs.style.right = '';
    obj.all_tabs.style.display = '';
    obj.all_tabs.style.flexDirection = '';
    obj.all_tabs.style.visibility = '';
    obj.all_tabs.style.opacity = '';
    obj.all_tabs.style.zIndex = '';

    // Remove card size classes
    obj.all_tabs.classList.remove('rsen-card-small', 'rsen-card-medium', 'rsen-card-large', 'rsen-card-xlarge');

    // Move the generation_tab node back to its parent
    if (obj.generation_tab_parent) {
        obj.generation_tab_parent.appendChild(obj.generation_tab);
    }

    if (obj.generation_tab_resize && obj.generation_tab_resize.parentNode) {
      obj.generation_tab_resize.remove();
    }

    // Restore the grid columns for the generation tab incase user made the columns
    if(obj.generation_tab.firstElementChild) {
      let tempVal = obj.generation_tab.firstElementChild.style.gridTemplateColumns;
      obj.generation_tab.firstElementChild.style.gridTemplateColumns = obj.lastGridTemplate.saved;
      obj.lastGridTemplate.saved = tempVal;
    }

    // Click the "Generation" tab button
    generationButton.click();
  }
}


/////////////////////////////
//9. Toggle Extra Networks Function (Part 6 - Closing Logic)
/////////////////////////////

});
// Toggle the state
rsen_toggleState = !rsen_toggleState;
}
}

/////////////////////////////
//10. UI Update Tracking Function
/////////////////////////////

onUiUpdate(function(args) {
  const lastTxt2imgTabButton = document.querySelector("#txt2img_extra_tabs > .tab-nav > .selected");
  const lastImg2imgTabButton = document.querySelector("#img2img_extra_tabs > .tab-nav > .selected");
  // onUiUpdate runs between localization so you have to check for both english and localized versions of the text
  let generationText = ["Generation", getText_ExtraNetworksSidePanel("Generation")];
  if(lastTxt2imgTabButton != null && typeof lastTxt2imgTabButton !== "undefined" && !generationText.includes(lastTxt2imgTabButton.innerHTML.trim())) {
    rsen_lastTxt2imgTabButton = lastTxt2imgTabButton;
  }
  if(lastImg2imgTabButton != null && typeof lastImg2imgTabButton !== "undefined" && !generationText.includes(lastImg2imgTabButton.innerHTML.trim())) {
    rsen_lastImg2imgTabButton = lastImg2imgTabButton;
  }
});

/////////////////////////////
//11. Method Override for Prompt Box Handling
/////////////////////////////

// for compact ui layout we need to hijack the method that moves the prompt box to the extra network tabs

onUiLoaded(function() {
  // We wrap this in onUiLoaded to ensure the original function is available
  if (typeof extraNetworksMovePromptToTab !== 'undefined') {
    // save the original method
    const extraNetworksMovePromptToTabOriginal = extraNetworksMovePromptToTab;

    // override the original to not operate when the side panel is open
    extraNetworksMovePromptToTab = (...args) => { 
      if(rsen_toggleState) return;
      return extraNetworksMovePromptToTabOriginal(...args);
    };
  }
});