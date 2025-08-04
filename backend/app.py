from typing import Dict, Type
from flask import Flask, request, jsonify
from flask_cors import CORS
from enum import Enum
from layers.activation_function_layers.convolutional_layer import ConvolutionalLayer, ConvolutionType
from layers.activation_function_layers.pooling_layer import PoolingLayer
from activation_functions.activation_function import ReLUFunction, LeakyReLUFunction, TanhFunction, SoftMaxFunction
from layers.misc_layers.custom_layer import CustomLayer
# Update imports for the new input layer structure
from layers.misc_layers.input_layer import (
    BaseInputLayer, 
    ImageInputLayer, 
    TextInputLayer, 
    TabularInputLayer, 
    AudioInputLayer, 
    VideoInputLayer
)
from layers.misc_layers.flattening_layer import FlatteningLayer
from layers.misc_layers.dense_layer import DenseLayer
from layers.misc_layers.embedding_layer import EmbeddingLayer
from layers.misc_layers.attention_layer import AttentionLayer
from layers.misc_layers.normalization_layer import NormalizationLayer
from layers.misc_layers.dropout_layer import DropoutLayer
from layers.misc_layers.recurrent_layer import RecurrentLayer
from layers.layer import Layer
import inspect
import json
from neural_network import NeuralNetwork
from connection import Connection
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
import os

app = Flask(__name__)
#how to use env variables in flask?

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

users = {
    "admin": {"password": "admin123"},
    "user1": {"password": "pass1"},
    "dvg": {"password": "dvg123"}
}

@app.route('/api/login', methods=['POST'])
def login():
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({"error": "Invalid credentials"}), 401
    
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)


CORS(app, resources={r"/api/*": {"origins": "*"}})

networks = []
current_id = 0

@app.route("/")
def hello_world():
    return "Hello, World!"

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "API is working!"})
    
def get_class_info(cls):    
    if issubclass(cls, Layer):
        all_params = []
        for c in cls.__mro__:
            if c == object:  
                break
                
            if hasattr(c, '__init__'):
                sig = inspect.signature(c.__init__)
                for name, param in sig.parameters.items():
                    if name != 'self' and name not in [p['name'] for p in all_params]:
                        param_type = param.annotation
                        param_info = {
                            "name": name,
                            "type": "string",
                            "is_basic": False 
                        }
                        
                       if cls == ConvolutionalLayer and name in ['conv_type', 'filters', 'kernel_size', 'stride', 'in_channels']:
                            param_info["is_basic"] = True
                        elif cls == PoolingLayer and name in ['pooling_type', 'pool_dimension', 'pool_size', 'kernel_size']:
                            param_info["is_basic"] = True
                        elif cls == BaseInputLayer and name in ['input_shape', 'input_type']:
                            param_info["is_basic"] = True
                        elif cls == DenseLayer and name in ['units']:
                            param_info["is_basic"] = True
                        elif cls == DropoutLayer and name in ['probability', 'inplace']:
                            param_info["is_basic"] = True
                        elif cls == FlatteningLayer and name in ['start_dim', 'end_dim']:
                            param_info["is_basic"] = True
                        elif cls == EmbeddingLayer and name in ['num_embeddings', 'embedding_dim']:
                            param_info["is_basic"] = True
                        elif cls == AttentionLayer and name in ['embed_dim', 'num_heads']:
                            param_info["is_basic"] = True
                        elif cls == NormalizationLayer and name in ['normalization_type']:
                            param_info["is_basic"] = True
                      
                        elif cls == RecurrentLayer and name in ['recurrent_type', 'input_size', 'hidden_size', 'num_layers']:
                            param_info["is_basic"] = True
                        
                        default_attr_name = f"DEFAULT_{name.upper()}"
                        if hasattr(c, default_attr_name):
                            default_value = getattr(c, default_attr_name)
                            # Handle enum values
                            if isinstance(default_value, Enum):
                                param_info["default"] = default_value.name
                            else:
                                param_info["default"] = default_value
                        elif param.default != inspect.Parameter.empty:
                            if isinstance(param.default, Enum):
                                param_info["default"] = param.default.name
                            else:
                                param_info["default"] = param.default
                                
                        if param_type != inspect.Parameter.empty:
                            if inspect.isclass(param_type) and issubclass(param_type, Enum):
                                param_info["type"] = "enum"
                                param_info["enum_type"] = param_type.__name__
                                param_info["enum_values"] = [e.name for e in param_type]
                            elif param_type == int:
                                param_info["type"] = "number"
                            elif param_type == float:
                                param_info["type"] = "number"
                            elif param_type == bool:
                                param_info["type"] = "boolean"
                            elif param_type == list or str(param_type).startswith("typing.List"):
                                param_info["type"] = "array"
                            elif param_type == dict or str(param_type).startswith("typing.Dict"):
                                param_info["type"] = "object"
                        
                        all_params.append(param_info)
        
        if hasattr(cls, '__name__') and cls.__name__.endswith('InputLayer') and cls != BaseInputLayer:
            if not any(p['name'] == 'input_type' for p in all_params):
                default_type = "IMAGE"  # Default fallback
                
                if cls.__name__ == "ImageInputLayer":
                    default_type = "IMAGE"
                elif cls.__name__ == "TextInputLayer":
                    default_type = "TEXT"
                elif cls.__name__ == "TabularInputLayer":
                    default_type = "TABULAR"
                elif cls.__name__ == "AudioInputLayer":
                    default_type = "AUDIO"
                elif cls.__name__ == "VideoInputLayer":
                    default_type = "VIDEO"
                
                all_params.append({
                    "name": "input_type",
                    "type": "enum",
                    "enum_type": "InputType",
                    "enum_values": [e.name for e in InputType],
                    "default": default_type
                })
                
        svg_data = None
        if hasattr(cls, 'get_svg_representation') and callable(getattr(cls, 'get_svg_representation')):
            svg_data = cls.get_svg_representation()

        return {
            "type": "layer",
            "name": cls.__name__,
            "params": all_params,
            "svg_representation": svg_data
        }
    
    return {"type": "unknown", "name": cls.__name__}

@app.route('/api/layer-types', methods=['GET'])
def get_layer_types():
    layer_types = [
        get_class_info(ConvolutionalLayer),
        get_class_info(PoolingLayer),
        get_class_info(ReLUFunction),
        get_class_info(LeakyReLUFunction),
        get_class_info(TanhFunction),
        get_class_info(SoftMaxFunction),
        get_class_info(BaseInputLayer),  
        get_class_info(ImageInputLayer), 
        get_class_info(TextInputLayer),
        get_class_info(TabularInputLayer),
        get_class_info(AudioInputLayer),
        get_class_info(VideoInputLayer),
        get_class_info(DenseLayer),
        get_class_info(FlatteningLayer),
        get_class_info(EmbeddingLayer),
        get_class_info(AttentionLayer),
        get_class_info(NormalizationLayer),
        get_class_info(DropoutLayer),
        get_class_info(RecurrentLayer),
        get_class_info(CustomLayer)

    ]

    return jsonify({
        "layer_types": layer_types
    })


@app.route('/api/networks', methods=['POST'])
def create_network():
    global current_id
    network_id = str(current_id)
    current_id += 1
    network = NeuralNetwork(network_id)
    networks.append(network)
    
    return jsonify({"id": network_id})

LAYER_TYPES : Dict[str, Type[Layer]] = {
    'ConvolutionalLayer': ConvolutionalLayer,
    'PoolingLayer': PoolingLayer,
    'ReLUFunction': ReLUFunction,
    'LeakyReLUFunction': LeakyReLUFunction,
    'TanhFunction': TanhFunction,
    'SoftMaxFunction': SoftMaxFunction,
    'BaseInputLayer': BaseInputLayer,
    'ImageInputLayer': ImageInputLayer,
    'TextInputLayer': TextInputLayer,
    'TabularInputLayer': TabularInputLayer,
    'AudioInputLayer': AudioInputLayer,
    'VideoInputLayer': VideoInputLayer,
    'DenseLayer': DenseLayer,
    'FlatteningLayer': FlatteningLayer,
    'EmbeddingLayer': EmbeddingLayer,
    'AttentionLayer': AttentionLayer,
    'NormalizationLayer': NormalizationLayer,
    'DropoutLayer': DropoutLayer,
    'RecurrentLayer': RecurrentLayer,
    'CustomLayer': CustomLayer
}

@app.route('/api/networks/<network_id>/layers', methods=['POST'])
def add_layer(network_id):
    data = request.json
    layer_type = data.get('type')
    params = data.get('params', {})

    layer_class = LAYER_TYPES.get(layer_type)
    
    if not layer_class:
        return jsonify({"error": f"Unknown layer type: {layer_type}"}), 400
        
    layer = layer_class.from_params(params)

    network = find_network_by_id(network_id)
    
    if not network:
        return jsonify({"error": f"Network not found: {network_id}"}), 404
        
    layer_id = len(network.layers)
    layer.id = layer_id
    network.add_layer(layer)

    return jsonify({"id": layer_id})

@app.route('/api/networks/<network_id>/connections', methods=['POST'])
def connect_layers(network_id):      
    data = request.json
    source_id = data.get('source')
    target_id = data.get('target')
    network = find_network_by_id(network_id)
    
    if not network:
        return jsonify({"error": f"Network not found: {network_id}"}), 404
        
    source_layer = network.find_layer(source_id)
    target_layer = network.find_layer(target_id)
    
    if not source_layer:
        return jsonify({"error": f"Source layer not found: {source_id}"}), 404
    if not target_layer:
        return jsonify({"error": f"Target layer not found: {target_id}"}), 404
   
    source_layer.connect_to(target_layer)
    
    connection_id = len(network.connections)
    connection = Connection(source_layer, target_layer)
    network.add_connection(connection)
    
    return jsonify({"id": connection_id})

events_log = []
@app.route('/api/user-logs', methods=['POST'])
def save_user_logs():
    data = request.get_json()
    event = data.get('events', [])
    events_log.append(event)
    return jsonify({'status': 'ok'})

@app.route('/api/user-logs', methods=['GET'])
def get_event_log():
    return jsonify(events_log)
    #download to file
    # with open('user_logs.jsonl', 'w') as f:
    #     for event in event_log:
    #         f.write(json.dumps(event) + '\\n')


def find_network_by_id(id) -> NeuralNetwork:
    for n in networks:
        if n.id == id:
            return n
    return None
        
if __name__ == '__main__':
    print("Starting Flask server on https://msc-project-8fbo.onrender.com")
    app.run(debug=True, host='0.0.0.0', port=10000)