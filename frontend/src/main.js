import ApiClient from "./api/ApiClient.js";
import NetworkModel from "./models/NetworkModel.js";
import UIManager from "./ui/UIManager.js";
import SessionTimer from "./utils/SessionTimer.js";
import Tracker from "./utils/Tracker.js";
class App {
  constructor() {
    this.uiManager = null;
    this.neuralNetwork = null;
    this.sessionTimer = SessionTimer;
    this.timersEnabled = true;
    this.loginEnabled = true;
  }

  async init() {
    document.querySelector('.app-container').style.display = 'none';
    try {
      // document.querySelector(".login-container").style.display = "none";
      if (this.loginEnabled) {
        this.setupLogin();
      }
      else
      {
        document.querySelector('.app-container').style.display = 'flex';
      }
      const isApiConnected = await ApiClient.testConnection();
      if (!isApiConnected) {
        throw new Error("Could not connect to API.");
      }
      this.uiManager = new UIManager();
      await NetworkModel.initialize();
      this.uiManager.layerPanel.renderLayerTypes(NetworkModel.layerTypes);

      document.addEventListener("keydown", (e) => {
        if (e.key === "t" && e.ctrlKey) {
          if (this.sessionTimer.isVisible) {
            this.sessionTimer.hide();
          } else {
            this.sessionTimer.show();
          }
        }
      });
      Tracker.setNetworkId(NetworkModel.id)

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
        document.querySelector(".app-container").style.display = "flex";

        if (res)
        {
          document.querySelector(".login-container").style.display = "none";
          this.sessionTimer.init();
          this.sessionTimer.show();
          Tracker.setUser(username);
        }
        
      } catch (error) {
        alert(`Login failed: ${error.message}`);
      }
    });
  }
}

const app = new App();
document.addEventListener("DOMContentLoaded", () => app.init());

window.app = app;
