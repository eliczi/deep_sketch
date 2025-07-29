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


class PyTorchCodeGenerator:
    def __init__(self, neural_network):
        self.network = neural_network

    def generate_code(self):
        code_lines = [
            'import torch',
            'import torch.nn as nn',
            '',
            'class GeneratedNet(nn.Module):',
            '    def __init__(self):',
            '        super().__init__()'
        ]
        # Generate layer definitions
        for idx, layer in enumerate(self.network.layers):
            layer_name = f'layer{idx}'
            # Example: handle DenseLayer
            if hasattr(layer, 'in_features') and hasattr(layer, 'out_features'):
                code_lines.append(f'        self.{layer_name} = nn.Linear({layer.in_features}, {layer.out_features})')
            # Add more layer types as needed
        code_lines.append('')
        code_lines.append('    def forward(self, x):')
        for idx, layer in enumerate(self.network.layers):
            layer_name = f'self.layer{idx}'
            if idx == 0:
                code_lines.append(f'        x = {layer_name}(x)')
            else:
                code_lines.append(f'        x = {layer_name}(x)')
        code_lines.append('        return x')
        code_lines.append('')
        code_lines.append('model = GeneratedNet()')
        return '\n'.join(code_lines)