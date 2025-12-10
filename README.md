# Add Extra Networks As A Side Panel

You can use this extension without affecting anything in the webui. It only adds an option to toggle the extra networks to be displayed on the right side of the screen.

**Note**: This uses Javascript to traverse the UI so if you have extensions that drastically alter the UI already it may not work as intended.

Below the `Generate` button there will be a new button to `Toggle Extra Networks`

![image](https://github.com/user-attachments/assets/7784b71f-9f9a-471c-b648-68a17baf28d7)

After clicking this button you will see the extra network tabs on the right of your screen and the normal generation settings on the left. Click the toggle button again to return the UI to normal.

![image](https://github.com/user-attachments/assets/b5b38d76-a323-42de-b5f2-3ea79a98f93c)

1.1:
Fix Compact Layout: Resolved a race condition causing prompt fields to disappear in Forge-Neo's "Compact Prompt Layout" mode by wrapping overrides in onUiLoaded.

Card Scaling: Added a UI slider to the toolbar allowing users to dynamically resize model cards (0.1x to 1.5x).

Panel Resizing: Reduced minimum width constraints to 150px and updated resize logic to allow for a much narrower side panel.

Layout Overhaul: Switched the side panel to absolute positioning to prevent it from stretching the page height, ensuring it matches the "Generation" tab exactly.

Scrolling Fixes: Enforced internal scrolling on tab containers to fix "blank" or non-scrollable content when the panel is constrained.

UI Polish: Fixed z-index and overflow issues to prevent folder names from overlapping the toolbar navigation.
