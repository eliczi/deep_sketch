from enum import Enum
from layers.layer import Layer
import os

class ConvolutionType(Enum):
    CONV1D = "Conv1D"
    CONV2D = "Conv2D"
    CONV3D = "Conv3D"
    
class PaddingType(Enum):
    VALID = "valid"
    SAME = "same"
    CAUSAL = "causal"

class DataFormat(Enum):
    CHANNELS_LAST = "channels_last"
    CHANNELS_FIRST = "channels_first"

class ConvolutionalLayer(Layer):
    path = os.path.join('.', 'assets', 'drawing.svg')
    
    DEFAULT_CONV_TYPE = ConvolutionType.CONV2D
    DEFAULT_FILTERS = 32
    DEFAULT_STRIDES = 1
    DEFAULT_KERNEL_SIZE = 3
    DEFAULT_PADDING = 'valid'
    DEFAULT_DILATION_RATE = 1
    

    def __init__(
        self,
        conv_type: ConvolutionType = ConvolutionType.CONV2D,
        filters=32,
        kernel_size=3,
        strides=1,
        padding: PaddingType = PaddingType.VALID,
        data_format: DataFormat = DataFormat.CHANNELS_LAST,
        dilation_rate=1,
        groups=1,
        activation=None,
        use_bias=True,
        kernel_initializer='glorot_uniform',
        bias_initializer='zeros',
        kernel_regularizer: str = None,
        bias_regularizer: str = None,
        activity_regularizer: str = None,
        kernel_constraint: str = None,
        bias_constraint: str = None,
        **kwargs
    ):
        super().__init__()
        self.conv_type = conv_type
        self.filters = filters
        self.kernel_size = kernel_size
        self.strides = strides
        self.padding = padding
        self.data_format = data_format
        self.dilation_rate = dilation_rate
        self.groups = groups
        self.activation = activation
        self.use_bias = use_bias
        self.kernel_initializer = kernel_initializer
        self.bias_initializer = bias_initializer
        self.kernel_regularizer = kernel_regularizer
        self.bias_regularizer = bias_regularizer
        self.activity_regularizer = activity_regularizer
        self.kernel_constraint = kernel_constraint
        self.bias_constraint = bias_constraint
        self.input_shape = None
        self.output_shape = None
        # Store any additional kwargs
        self.extra_params = kwargs

    @classmethod
    def from_params(cls, params):
        print(params)
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
        strides = parse_tuple(params.get('strides', 2), ndim)
        dilation_rate = parse_tuple(params.get('dilation_rate', 1), ndim)
        return cls(
            conv_type=conv_type,
            filters=params.get('filters', 32),
            kernel_size=kernel_size,
            strides=strides,
            padding=params.get('padding', 'valid'),
            data_format=params.get('data_format', None),
            dilation_rate=dilation_rate,
            groups=params.get('groups', 1),
            activation=params.get('activation', None),
            use_bias=params.get('use_bias', True),
            kernel_initializer=params.get('kernel_initializer', 'glorot_uniform'),
            bias_initializer=params.get('bias_initializer', 'zeros'),
            kernel_regularizer=params.get('kernel_regularizer', None),
            bias_regularizer=params.get('bias_regularizer', None),
            activity_regularizer=params.get('activity_regularizer', None),
            kernel_constraint=params.get('kernel_constraint', None),
            bias_constraint=params.get('bias_constraint', None),
            **{k: v for k, v in params.items() if k not in {
                'conv_type', 'filters', 'kernel_size', 'strides', 'padding', 'data_format',
                'dilation_rate', 'groups', 'activation', 'use_bias', 'kernel_initializer',
                'bias_initializer', 'kernel_regularizer', 'bias_regularizer', 'activity_regularizer',
                'kernel_constraint', 'bias_constraint'
            }}
        )
    

    def set_filters(size):
        pass