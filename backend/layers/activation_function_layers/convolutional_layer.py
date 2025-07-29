from enum import Enum
from layers.layer import Layer
import os

class ConvolutionType(Enum):
    CONV1D = "Conv1D"
    CONV2D = "Conv2D"
    CONV3D = "Conv3D"
    
class PaddingMode(Enum):
    ZEROS = "zeros"
    REPLICATE = "replicate"
    REFLECT = "reflect"
    CIRCULAR = "circular"

class DataFormat(Enum):
    CHANNELS_LAST = "channels_last"
    CHANNELS_FIRST = "channels_first"

class ConvolutionalLayer(Layer):
    path = os.path.join('.', 'assets', 'drawing.svg')
    
    DEFAULT_CONV_TYPE = ConvolutionType.CONV2D
    DEFAULT_FILTERS = 32
    DEFAULT_STRIDES = 1
    DEFAULT_KERNEL_SIZE = 3
    DEFAULT_PADDING = 1
    DEFAULT_DILATION_RATE = 1
    DEFAULT_PADDING_MODE = PaddingMode.ZEROS
    

    def __init__(
        self,
        conv_type: ConvolutionType = ConvolutionType.CONV2D,
        in_channels=32,
        out_channels=32,
        kernel_size=3,
        stride=1,
        padding = 0,
        dilation=1,
        groups=1,
        bias=True,
        padding_mode:PaddingMode=DEFAULT_PADDING_MODE,
        
    ):
        super().__init__()
        self.conv_type = conv_type
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.stride = stride
        self.padding = padding
        self.dilation= dilation
        self.groups = groups
        self.bias = bias
        self.padding_mode = padding
 

    @classmethod
    def from_params(cls, params):
        conv_type_str = params.get('conv_type', 'CONV2D') 
        conv_type = ConvolutionType[conv_type_str]
        ndim = {"Conv1D": 1, "Conv2D": 2, "Conv3D": 3}[conv_type.value]

        def parse_tuple(val, ndim):
            if isinstance(val, (list, tuple)):
                if len(val) == ndim:
                    return tuple(val)
                elif len(val) == 1:
                    return tuple(val * ndim)
            return tuple([val] * ndim)

        kernel_size = parse_tuple(params.get('kernel_size', 3), ndim)
        stride = parse_tuple(params.get('stride', 2), ndim)
        dilation = parse_tuple(params.get('dilation', 1), ndim)
        return cls(
            conv_type=conv_type,
            in_channels=params.get('in_channels', 32),
            out_channels=params.get('out_channels', 32),
            kernel_size=kernel_size,
            stride=stride,
            padding=params.get('padding', 1),
            dilation=dilation,
            groups=params.get('groups', 1),
            bias=params.get('bias', True),
            padding_mode=params.get('padding_mode', 'zeroes'),
           
        )
    

    def set_filters(size):
        pass