from enum import Enum
from layers.layer import Layer
import os

class PoolingType(Enum):
    MAX = "MAX"
    AVG = "AVG"

class PoolingDimension(Enum):
    POOL1D = "Pool1D"
    POOL2D = "Pool2D"
    POOL3D = "Pool3D"

class PaddingType(Enum):
    VALID = "VALID"
    SAME = "SAME"

class PoolingLayer(Layer):
    path = os.path.join('.', 'assets', 'pooling.svg')
    
    DEFAULT_POOL_TYPE = PoolingType.MAX
    DEFAULT_POOL_DIM = PoolingDimension.POOL2D
    DEFAULT_KERNEL_SIZE = 32
    DEFAULT_PADDING = PaddingType.VALID
    
    def __init__(
        self,
        pooling_type: PoolingType = DEFAULT_POOL_TYPE,
        pool_dimension: PoolingDimension = DEFAULT_POOL_DIM,
        kernel_size = 32,
        stride = 1,
        padding: PaddingType = DEFAULT_PADDING,
        dilation = 1,
        return_indices = False,
        ceil_mode = False
    ):
        ndim = {"Pool1D": 1, "Pool2D": 2, "Pool3D": 3}[pool_dimension.value]
        
            
        super().__init__()
        self.pooling_type = pooling_type
        self.pool_dimension = pool_dimension
        self.kernel_size = kernel_size
        self.stride = stride
        self.padding = padding
        self.dilation = dilation
        self.return_indices = return_indices
        self.ceil_mode = ceil_mode

    @classmethod
    def from_params(cls, params):
        pool_dim_str = params.get('pool_dimension', 'POOL2D')
        pool_dimension = PoolingDimension[pool_dim_str]
        ndim = {"Pool1D": 1, "Pool2D": 2, "Pool3D": 3}[pool_dimension.value]
        
        def parse_tuple(val, ndim):
            if isinstance(val, (list, tuple)):
                if len(val) == ndim:
                    return tuple(val)
                elif len(val) == 1:
                    return tuple(val * ndim)
            return tuple([val] * ndim)
            
        kernel_size = parse_tuple(params.get('kernel_size', cls.DEFAULT_KERNEL_SIZE), ndim)
        stride = parse_tuple(params.get('stride', kernel_size), ndim)
        
        return cls(
            pooling_type=PoolingType(params.get('pooling_type', cls.DEFAULT_POOL_TYPE.value)),
            pool_dimension=pool_dimension,  
            kernel_size=kernel_size,
            stride=stride,
            padding=PaddingType(params.get('padding', cls.DEFAULT_PADDING.value)),
            dilation=params.get('dilation', 1),
            return_indices=params.get('return_indices', False),
            ceil_mode=params.get('ceil_mode', False)
        )
    
   
