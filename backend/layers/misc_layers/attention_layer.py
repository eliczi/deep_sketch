from layers.layer import Layer
import os


class AttentionLayer(Layer):
    path = os.path.join('.', 'assets', 'attention_layer.svg')
    
    def __init__(self, target_shape=None):
        super().__init__()
        self.target_shape = target_shape

    @classmethod
    def from_params(cls, params):
        return cls()
