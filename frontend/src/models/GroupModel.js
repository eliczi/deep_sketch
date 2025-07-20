/**
 * Represents a group of layers or other groups in the network model.
 * Used for managing hierarchical groupings of nodes.
 * @class
 */
class GroupModel {

  constructor(id) {
    this.id = id;
    this.layers = []
    this.groups = []
  }
}

export default GroupModel;