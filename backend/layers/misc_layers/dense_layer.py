from layers.layer import Layer
import os


class DenseLayer(Layer):
    path = os.path.join('.', 'assets', 'dense_layer.svg')

    DEFAULT_IN_FEATURES = 10
    DEFAULT_OUT_FEATURES = 50
    DEFAULT_BIAS = True

    def __init__(self, in_features=DEFAULT_IN_FEATURES, out_features=DEFAULT_OUT_FEATURES, bias=DEFAULT_BIAS):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.bias = bias
    
    @classmethod
    def from_params(cls, params):
        return cls(
            in_features=params.get('in_features', cls.DEFAULT_IN_FEATURES),
            out_features=params.get('out_features', cls.DEFAULT_OUT_FEATURES),
            bias=params.get('bias', cls.DEFAULT_BIAS)
        )
    

    