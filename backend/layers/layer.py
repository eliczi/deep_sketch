class Layer:
    def __init__(self):
        self.connections = []
        self.id = None

    def connect_to(self, layer):
        self.connections.append(layer)
        
    @classmethod
    def from_params(cls, params):
        """Create a layer instance from parameters. Must be implemented by subclasses."""
        return cls()

    @classmethod
    def load_svg(cls):
        if cls.path is None:
            raise NotImplementedError("Subclasses must define 'path' attribute")
        with open(cls.path, 'r') as svg_file:
            return svg_file.read()
        
    @classmethod
    def get_svg_representation(cls):
        return {
            "svg_content": cls.load_svg()
        }
        
        