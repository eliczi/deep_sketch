from layers.layer import Layer
import os

#the custom layer is a layer that can be used to create a custom layer, no params are needed, unless user defines them later

class CustomLayer(Layer):
    path = os.path.join('.', 'assets', 'custom_layer.svg')

    def __init__(self):
        super().__init__()
       
    
    @classmethod
    def from_params(cls, params):
        return cls()
    

    