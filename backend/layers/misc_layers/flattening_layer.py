from layers.layer import Layer
import os


class FlatteningLayer(Layer):
    path = os.path.join('.', 'assets', 'flattening_layer.svg')
    
    def __init__(self):
        super().__init__()

    
    @classmethod
    def from_params(cls, params):
        return cls()
    
 
    