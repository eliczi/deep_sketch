
class Tracker {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }


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


    trackConnectionOperation(action, connection) {
        this.trackEvent('connection', action, {
            sourceId: connection.sourceId,
            targetId: connection.targetId,
            configuration: connection.config,
            timestamp: Date.now()
        });
    }


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