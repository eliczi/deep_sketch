from layers.layer import Layer
import os
from enum import Enum
from typing import List, Tuple, Optional, Union, Dict, Any


class InputType(Enum):
    IMAGE = "Image"
    TEXT = "Text"
    TABULAR = "Tabular"
    AUDIO = "Audio"
    VIDEO = "Video"


class BaseInputLayer(Layer):
    """Base class for all input layers"""
    base_path = os.path.join('.', 'assets', 'input')
    
    def __init__(self, input_type: InputType):
        super().__init__()
        self.input_type = input_type
    
    @classmethod
    def from_params(cls, params: Dict[str, Any]):
        """Factory method to create the appropriate input layer type"""
        input_type_str = params.get('input_type', 'IMAGE')
        try:
            input_type = InputType[input_type_str]
        except KeyError:
            input_type = InputType.IMAGE
        
        # Create the appropriate input layer based on type
        if input_type == InputType.IMAGE:
            return ImageInputLayer()
        elif input_type == InputType.TEXT:
            return TextInputLayer()
        elif input_type == InputType.TABULAR:
            return TabularInputLayer()
        elif input_type == InputType.AUDIO:
            return AudioInputLayer()
        elif input_type == InputType.VIDEO:
            return VideoInputLayer()
    
    @classmethod
    def get_svg_path(cls, input_type_name="IMAGE"):
        if isinstance(input_type_name, InputType):
            input_type_name = input_type_name.name
            
        type_str = f"input_{input_type_name.lower()}"
        return os.path.join(cls.base_path, f"{type_str}.svg")
    
    @classmethod
    def load_svg(cls, input_type_name="IMAGE"):
        svg_path = cls.get_svg_path(input_type_name)
        try:
            with open(svg_path, 'r') as svg_file:
                return svg_file.read()
        except FileNotFoundError:
            default_path = cls.get_svg_path("IMAGE")
            with open(default_path, 'r') as svg_file:
                return svg_file.read()
    
    @staticmethod
    def get_svg_representation():
        svg_representations = {}
        
        for input_type in InputType:
            try:
                svg_content = BaseInputLayer.load_svg(input_type.name)
                svg_representations[input_type.name] = svg_content
            except Exception as e:
                print(f"Failed to load SVG for {input_type.name}: {e}")
                if input_type.name != "IMAGE":
                    svg_representations[input_type.name] = BaseInputLayer.load_svg("IMAGE")
        
        return {
            "svg_content": BaseInputLayer.load_svg("IMAGE"),  # default representation
            "all_representations": svg_representations
        }
    
    def get_config(self):
        """Return base configuration that all input layers share"""
        config = {'input_type': self.input_type.name}
        return config


class ImageInputLayer(BaseInputLayer):
    """Input layer for image data"""
    
    def __init__(self):
                #  shape: Optional[List[int]] = None,
                #  channels: int = 3, 
                #  color_mode: str = "rgb"):
        super().__init__(InputType.IMAGE)
        # self.shape = shape or [28, 28]  # Default to common image size
        # self.width = 28
        # self.height = 28
        # self.channels = channels
        # self.color_mode = color_mode
    
    def get_config(self):
        # config = super().get_config()
        # config.update({
        #     'shape': self.shape,
        #     'channels': self.channels,
        #     'color_mode': self.color_mode
        # })
        return config


class TextInputLayer(BaseInputLayer):
    """Input layer for text data"""
    
    def __init__(self): 
                #  vocab_size: int = 10000,
                #  sequence_length: int = 100, 
                #  embedding_dim: int = 128, 
                #  tokenizer: str = "word"):
        super().__init__(InputType.TEXT)
        # self.vocab_size = vocab_size
        # self.sequence_length = sequence_length
        # self.embedding_dim = embedding_dim
        # self.tokenizer = tokenizer
    
    def get_config(self):
        config = super().get_config()
        # config.update({
        #     'vocab_size': self.vocab_size,
        #     'sequence_length': self.sequence_length,
        #     'embedding_dim': self.embedding_dim,
        #     'tokenizer': self.tokenizer
        # })
        return config


class TabularInputLayer(BaseInputLayer):
    """Input layer for tabular data"""
    
    def __init__(self): 
        super().__init__(InputType.TABULAR)
   
    def get_config(self):
        config = super().get_config()
        return config


class AudioInputLayer(BaseInputLayer):
    """Input layer for audio data"""
    
    def __init__(self):

        super().__init__(InputType.AUDIO)
      
    
    def get_config(self):
        config = super().get_config()
        return config


class VideoInputLayer(BaseInputLayer):
    """Input layer for video data"""
    
    def __init__(self):
        super().__init__(InputType.VIDEO)

    
    def get_config(self):
        config = super().get_config()
       
        return config


# For backward compatibility with existing code
class InputLayer(BaseInputLayer):
    """Legacy class for backward compatibility"""
    
    def __init__(self, input_type: InputType, shape=None, **kwargs):
        super().__init__(input_type)
        self.shape = shape
        self.__dict__.update(kwargs)
    
    def set_shape(self, shape):
        self.shape = shape