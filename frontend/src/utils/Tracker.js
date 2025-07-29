import apiClient from "../api/ApiClient.js";
class Tracker {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
    this.user = null;
    this.networkId = null;
  }

  setUser(user) {
    this.user = user;
  }
  setNetworkId(networkId) {
    this.networkId = networkId;
  }

  trackConnectionOperationStart(action, details) {
    this.trackEvent("connection", action, details);
  }
  trackConnectionOperationEnd(action, details) {
    this.trackEvent("connection", action, details);
  }
  trackSidebarOperation(action, details) {
    this.trackEvent("sidebar", action, details);
  }

  trackDragOperation(action, details) {
    this.trackEvent("drag", action, details);
  }

  trackLayerOperation(action, layer) {
    this.trackEvent("layer", action, {
      layerId: layer.id,
      type: layer.type,
      position: {
        x: layer.position.x,
        y: layer.position.y,
      },
      configuration: layer.config,
      timestamp: Date.now(),
    });
  }

  trackConnectionOperation(action, connection) {
    this.trackEvent("connection", action, {
      sourceId: connection.sourceId,
      targetId: connection.targetId,
      configuration: connection.config,
      timestamp: Date.now(),
    });
  }

  trackGroupOperation(action, group) {
    this.trackEvent("group", action, {
      groupId: group.id,
      layers: group.layerIds,
      name: group.name,
      isExpanded: group.isExpanded,
      timestamp: Date.now(),
    });
  }
  trackEvent(category, action, details) {
    const event = {
      user: this.user,
      networkId: this.networkId,
      timestamp: Date.now(),
      sessionTime: Date.now() - this.sessionStart,
      category,
      action,
      details,
    };
    this.events.push(event);
    this.sendLogToServer(event);
  }
  //send one log
  sendLogToServer(event) {
    apiClient.sendLogToServer(event);
  }

  getEvents() {
    return this.events;
  }

  getEventsByCategory(category) {
    return this.events.filter((event) => event.category === category);
  }

  clearEvents() {
    this.events = [];
    this.sessionStart = Date.now();
  }
}

const tracker = new Tracker();
export default tracker;
