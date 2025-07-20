/**
 * Tracks user interactions in the neural network builder
 */
class Tracker {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }

    /**
     * Tracks a layer operation
     * @param {string} action - 'create' or 'delete'
     * @param {Object} layer - Layer information
     * @param {string} layer.id - Layer ID
     * @param {string} layer.type - Layer type
     * @param {Object} layer.position - Layer position
     * @param {number} layer.position.x - X coordinate
     * @param {number} layer.position.y - Y coordinate
     * @param {Object} layer.config - Layer configuration parameters
     */
    trackLayerOperation(action, layer) {
        this.trackEvent('layer', action, {
            layerId: layer.id,
            type: layer.type,
            position: {
                x: layer.position.x,
                y: layer.position.y
            },
            configuration: layer.config,
            timestamp: Date.now()
        });
    }

    /**
     * Tracks a connection operation
     * @param {string} action - 'create' or 'delete'
     * @param {Object} connection - Connection information
     * @param {string} connection.sourceId - Source layer ID
     * @param {string} connection.targetId - Target layer ID
     * @param {Object} connection.config - Connection configuration
     */
    trackConnectionOperation(action, connection) {
        this.trackEvent('connection', action, {
            sourceId: connection.sourceId,
            targetId: connection.targetId,
            configuration: connection.config,
            timestamp: Date.now()
        });
    }

    /**
     * Tracks a group operation
     * @param {string} action - 'create', 'delete', 'rename', 'collapse', or 'expand'
     * @param {Object} group - Group information
     * @param {string} group.id - Group ID
     * @param {Array<string>} group.layerIds - IDs of layers in the group
     * @param {string} [group.name] - Group name (for rename action)
     * @param {boolean} [group.isExpanded] - Group expansion state (for collapse/expand actions)
     */
    trackGroupOperation(action, group) {
        this.trackEvent('group', action, {
            groupId: group.id,
            layers: group.layerIds,
            name: group.name,
            isExpanded: group.isExpanded,
            timestamp: Date.now()
        });
    }
    trackEvent(category, action, details) {
        const event = {
            timestamp: Date.now(),
            sessionTime: Date.now() - this.sessionStart,
            category,
            action,
            details
        };
        this.events.push(event);
        
        
        console.log(`Tracked ${category} ${action}:`, details);
    }


    getEvents() {
        return this.events;
    }

    getEventsByCategory(category) {
        return this.events.filter(event => event.category === category);
    }

    clearEvents() {
        this.events = [];
        this.sessionStart = Date.now();
    }
}


const tracker = new Tracker();
export default tracker;