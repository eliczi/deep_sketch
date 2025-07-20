from layers.layer import Layer
import os
class ActivationFunction(Layer):
    def __init__(self):
        super().__init__()


class ReLUFunction(ActivationFunction):
    def __init__(self):
        super().__init__()
        
        
    @classmethod
    def from_params(cls, params):
        #placeholder values
        return cls()
        
    @staticmethod
    def load_svg():
        svg_path = os.path.join('.', 'assets', 'relu.svg')
        with open(svg_path, 'r') as svg_file:
            return svg_file.read()
    
    @staticmethod
    def get_svg_representation():
        return {
            "svg_content": ReLUFunction.load_svg()
        }

class SoftMaxFunction(ActivationFunction):
    def __init__(self):
        super().__init__()
        
        
    @classmethod
    def from_params(cls, params):
        #placeholder values
        return cls()
        
    @staticmethod
    def load_svg():
        svg_path = os.path.join('.', 'assets', 'softmax.svg')
        with open(svg_path, 'r') as svg_file:
            return svg_file.read()
    
    @staticmethod
    def get_svg_representation():
        return {
            "svg_content": SoftMaxFunction.load_svg()
        }

class SigmoidFunction(ActivationFunction):
    pass

class TanhFunction(ActivationFunction):
    def __init__(self):
        super().__init__()
        
        
    @classmethod
    def from_params(cls, params):
        #placeholder values
        return cls()
        
    @staticmethod
    def load_svg():
        svg_path = os.path.join('.', 'assets', 'tanh.svg')
        with open(svg_path, 'r') as svg_file:
            return svg_file.read()
    
    @staticmethod
    def get_svg_representation():
        return {
            "svg_content": TanhFunction.load_svg()
        }

class IdentityFunction(ActivationFunction):
    pass

class LeakyReLUFunction(ActivationFunction):
    def __init__(self, alpha):
        super().__init__()
        self.alpha = alpha
        
        
    @classmethod
    def from_params(cls, params):
        #placeholder values
        return cls(0.01)
        
    @staticmethod
    def load_svg():
        svg_path = os.path.join('.', 'assets', 'leaky_relu.svg')
        with open(svg_path, 'r') as svg_file:
            return svg_file.read()
    
    @staticmethod
    def get_svg_representation():
        return {
            "svg_content": LeakyReLUFunction.load_svg()
        }