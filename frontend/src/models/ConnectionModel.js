class ConnectionModel {
  constructor(
    id,
    sourceId,
    targetId,
    sourceNode,
    targetNode,
    connectionElement,
    groupId = null,
  ) {
    this.id = id;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.source_node = sourceNode;
    this.target_node = targetNode;
    this.connectionElement = connectionElement;
    this.groupId = groupId;
  }
}

export default ConnectionModel;
