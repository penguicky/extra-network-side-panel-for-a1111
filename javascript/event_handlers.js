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
        generation_tab: document.getElementById('txt2img_settings').parentNode.parentNode,
        generation_tab_att_id: 'txt2img_generation_tab',
        new_id: 'txt2img_toggle_extra'
      },
      { // Image2Image elements
        tools: document.getElementById('img2img_tools'),
        last_button:  document.getElementById('deepbooru'),
        generation_tab: document.getElementById('img2img_settings').parentNode.parentNode,
        generation_tab_att_id: 'img2img_generation_tab',
        new_id: 'img2img_toggle_extra'
      }
    ];
    if(typeof settingsObjects[0].last_button != "undefined" && typeof settingsObjects[1].last_button != "undefined") {
      // Loop through each object in the array we created earlier
      settingsObjects.forEach(obj => {
        // Do init code
        let newButton = obj.last_button.cloneNode(false); // Duplicate the last_button
        newButton.id = obj.new_id; // Change the id to new_id
        newButton.title = "Toggle Extra Networks."; // Change the title
        newButton.innerHTML = rsen_extra_networks_symbol; // Change the innerHTML

        obj.last_button.parentNode.insertBefore(newButton, obj.last_button.nextSibling); // Insert the new button after the last_button

        newButton.onclick = () => rsen_toggleExtraNetworks(); // Add new click event

        // Set an id for the inner generation tab div and parent div
        obj.generation_tab.setAttribute("sd-enr-id", obj.generation_tab_att_id);
        obj.generation_tab.parentNode.setAttribute("sd-enr-id", obj.generation_tab_att_id + "_parent");
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
  // Get all the elements you are interested in and put them into an object to make the later code a bit cleaner
  let settingsObjects = [
    { // Text2Image elements
      all_tabs: document.getElementById('txt2img_extra_tabs'),
      generation_tab_parent: document.querySelector('[sd-enr-id="txt2img_generation_tab_parent"]'),
      generation_tab: document.querySelector('[sd-enr-id="txt2img_generation_tab"]'),
      generation_tab_resize: document.getElementById('txt2img_generation_tab_resize'),
      generation_tab_resize_id: 'txt2img_generation_tab_resize',
      tab_nav: document.querySelector('#txt2img_extra_tabs > .tab-nav'),
      lastTabButton: rsen_lastTxt2imgTabButton,
      lastGridTemplate: rsen_lastGenerationTabGridTemplateTxt2img,
      toprow: document.getElementById('txt2img_toprow')
    },
    { // Image2Image elements
      all_tabs: document.getElementById('img2img_extra_tabs'),
      generation_tab_parent: document.querySelector('[sd-enr-id="img2img_generation_tab_parent"]'),
      generation_tab: document.querySelector('[sd-enr-id="img2img_generation_tab"]'),
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
if (typeof settingsObjects[0].generation_tab != "undefined" && typeof settingsObjects[1].generation_tab != "undefined") {
  // Loop through each object in the array we created earlier
  settingsObjects.forEach(obj => {
    // Find the tab buttons with the text for the default tab and "Generation" tab
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
    obj.all_tabs.parentNode.style.display = 'flex';
    obj.all_tabs.parentNode.style.flexDirection = 'row';
    obj.all_tabs.parentNode.style.flexWrap = 'wrap';
    obj.all_tabs.parentNode.style.alignItems = 'stretch';
    obj.all_tabs.parentNode.style.width = '100%';
    obj.all_tabs.parentNode.style.overflow = 'hidden';

    // 1. First, ensure the generation tab is on the left with proper class
    if (!obj.generation_tab.className.includes('svelte-vt1mxs gap')) {
      obj.generation_tab.className += " svelte-vt1mxs gap";
    }
    obj.generation_tab.style.flex = '0 0 auto';
    obj.generation_tab.style.width = '40vw';
    obj.generation_tab.style.minWidth = '200px';
    obj.generation_tab.style.maxWidth = '60vw';
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
    let resizeDiv = document.createElement('div');
    resizeDiv.setAttribute('id', obj.generation_tab_resize_id);
    resizeDiv.style.cursor = 'col-resize';
    resizeDiv.style.width = '16px';
    resizeDiv.style.minHeight = '100%';
    resizeDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    resizeDiv.style.margin = '0 8px';
    resizeDiv.style.flex = '0 0 16px';
    resizeDiv.style.zIndex = '10';
    
    // Insert the resize div after the generation tab
    obj.all_tabs.parentNode.insertBefore(resizeDiv, obj.generation_tab.nextSibling);

    // 3. Ensure the extra tabs are on the right
    obj.all_tabs.style.flex = '1';
    obj.all_tabs.style.minWidth = '300px';
    obj.all_tabs.style.position = 'relative';
    obj.all_tabs.style.display = 'block';
    obj.all_tabs.style.visibility = 'visible';
    obj.all_tabs.style.opacity = '1';
    
    // Make sure the extra tabs have the correct classes
    if (!obj.all_tabs.className.includes('extra-networks')) {
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
        let maxWidth = obj.all_tabs.parentNode.offsetWidth - 400;
        
        if (newWidth > 200 && newWidth < maxWidth) {
          // offsetWidth is the width of the block-1
          obj.generation_tab.style.width = newWidth  + "px";
          // update variable - till this pos, mouse movement has been handled
          dragX = e.clientX;
        }
      }
      // remove mouse-move listener on mouse-up (drag is finished now)
      document.onmouseup = () => document.onmousemove = document.onmouseup = null;
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

    // Reset the generation tab
    obj.generation_tab.className = obj.generation_tab.className.replace(" svelte-vt1mxs gap", "");
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
    obj.all_tabs.style.position = '';
    obj.all_tabs.style.display = '';
    obj.all_tabs.style.visibility = '';
    obj.all_tabs.style.opacity = '';

    // Move the generation_tab node back to its parent
    obj.generation_tab_parent.appendChild(obj.generation_tab);

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

// save the original method
const extraNetworksMovePromptToTabOriginal = extraNetworksMovePromptToTab;

// override the original to not operate when the side panel is open
extraNetworksMovePromptToTab = (...args) => { 
  if(rsen_toggleState) return;
  return extraNetworksMovePromptToTabOriginal(...args);
};