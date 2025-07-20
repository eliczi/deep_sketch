from layers.layer import Layer
import os


class DropoutLayer(Layer):
    path = os.path.join('.', 'assets', 'dropout_layer.svg')
    
    def __init__(self, probability=0.5, inplace=False):
        super().__init__()
        self.probability = probability
        self.inplace = inplace
    
    @classmethod
    def from_params(cls, params):
        return cls(
            probability=params.get('probability', 0.5),
            inplace=params.get('inplace', False)
        )
    
