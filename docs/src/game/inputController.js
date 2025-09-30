/**
 * Manages the state of user input (keyboard, mouse, etc.) for the game.
 * This class provides methods to enable, disable, and check the status of input,
 * which is crucial for preventing actions during animations or menus.
 */
export class InputController {
    constructor() {
        // Input is enabled by default upon creation
        this.enabled = true;
    }

    /**
     * Enables input and logs the change.
     */
    enable() {
        this.enabled = true;
        console.log('Input enabled');
    }

    /**
     * Disables input and logs the change.
     */
    disable() {
        this.enabled = false;
        console.log('Input disabled');
    }

    /**
     * Checks if input is currently enabled.
     * @returns {boolean} True if input is enabled, false otherwise.
     */
    isEnabled() {
        return this.enabled;
    }
}
