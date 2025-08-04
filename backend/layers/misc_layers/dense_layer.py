from layers.layer import Layer
import os


class DenseLayer(Layer):
    path = os.path.join('.', 'assets', 'dense_layer.svg')

    DEFAULT_IN_FEATURES = 10
    DEFAULT_UNITS = 50
    DEFAULT_BIAS = True

    def __init__(self, in_features=DEFAULT_IN_FEATURES, units=DEFAULT_UNITS, bias=DEFAULT_BIAS):
        super().__init__()
        self.in_features = in_features
        self.units = units
        self.bias = bias
    
    @classmethod
    def from_params(cls, params):
        return cls(
            in_features=params.get('in_features', cls.DEFAULT_IN_FEATURES),
            units=params.get('units', cls.DEFAULT_UNITS),
            bias=params.get('bias', cls.DEFAULT_BIAS)
        )
    

    