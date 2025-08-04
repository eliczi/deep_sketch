from layers.layer import Layer


class NeuralNetwork:
    def __init__(self, id):
        self.id = id
        self.layers = []
        self.connections = []        
    
    def add_layer(self, layer):
        self.layers.append(layer)

    def add_connection(self, connection):
        self.connections.append(connection)
        
    def find_layer(self, id) -> Layer:
        for l in self.layers:
            if l.id == id:
                return l
