import ApiClient from "./api/ApiClient.js";
import NetworkModel from "./models/NetworkModel.js";
import UIManager from "./ui/UIManager.js";
import SessionTimer from "./utils/SessionTimer.js";

/**
 * Main application class for initializing the UI, network, and session timer.
 * Handles app startup, API connection, and login logic.
 * @class
 */
class App {
  constructor() {
    this.uiManager = null;
    this.neuralNetwork = null;
    this.sessionTimer = SessionTimer;
    this.timersEnabled = true;
  }

  async init() {
    //document.querySelector('.app-container').style.display = 'none';

    try {
      const isApiConnected = await ApiClient.testConnection();
      if (!isApiConnected) {
        throw new Error("Could not connect to API.");
      }
      this.uiManager = new UIManager();
      await NetworkModel.initialize();
      this.uiManager.layerPanel.renderLayerTypes(NetworkModel.layerTypes);

      // Initialize and start session timer
      this.sessionTimer.init();
      this.sessionTimer.show();

      // Add keyboard shortcut to toggle timer
      document.addEventListener("keydown", (e) => {
        if (e.key === "t" && e.ctrlKey) {
          if (this.sessionTimer.isVisible) {
            this.sessionTimer.hide();
          } else {
            this.sessionTimer.show();
          }
        }
      });
    } catch (error) {
      console.error("App: Initialization failed:", error);
      alert(`Initialization failed: ${error.message}.`);
    }
  }

  setupLogin() {
    const loginBtn = document.getElementById("login-btn");
    loginBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const res = await ApiClient.login(username, password);
        alert("Login successful!");
        document.querySelector(".login-container").style.display = "none";
        document.querySelector(".app-container").style.display = "flex";

        // Start session timer after successful login
        this.sessionTimer.reset();
        this.sessionTimer.show();
      } catch (error) {
        alert(`Login failed: ${error.message}`);
      }
    });
  }
}

const app = new App();
document.addEventListener("DOMContentLoaded", () => app.init());

window.app = app;
