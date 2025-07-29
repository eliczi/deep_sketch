from layers.layer import Layer
import os


class FlatteningLayer(Layer):
    path = os.path.join('.', 'assets', 'flattening_layer.svg')
    
    def __init__(self, start_dim=1, end_dim=-1):
        super().__init__()
        self.start_dim = start_dim
        self.end_dim = end_dim
    
    @classmethod
    def from_params(cls, params):
        return cls(
            start_dim=params.get('start_dim', 1),
            end_dim=params.get('end_dim', -1)
        )
    
 
    