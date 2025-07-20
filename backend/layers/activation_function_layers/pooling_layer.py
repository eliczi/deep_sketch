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
    DEFAULT_POOL_SIZE = 2
    DEFAULT_PADDING = PaddingType.VALID
    
    def __init__(
        self,
        pooling_type: PoolingType = DEFAULT_POOL_TYPE,
        pool_dimension: PoolingDimension = DEFAULT_POOL_DIM,
        pool_size = None,
        strides = 1,
        padding: PaddingType = DEFAULT_PADDING
    ):
        ndim = {"Pool1D": 1, "Pool2D": 2, "Pool3D": 3}[pool_dimension.value]
        if pool_size is None:
            pool_size = tuple([DEFAULT_POOL_SIZE] * ndim)
        if strides is None:
            strides = pool_size
            
        super().__init__()
        self.pooling_type = pooling_type
        self.pool_dimension = pool_dimension
        self.pool_size = pool_size
        self.strides = strides
        self.padding = padding

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
            
        pool_size = parse_tuple(params.get('pool_size', cls.DEFAULT_POOL_SIZE), ndim)
        strides = parse_tuple(params.get('strides', pool_size), ndim)
        
        return cls(
            pooling_type=PoolingType(params.get('pooling_type', cls.DEFAULT_POOL_TYPE.value)),
            pool_dimension=pool_dimension,
            pool_size=pool_size,
            strides=strides,
            padding=PaddingType(params.get('padding', cls.DEFAULT_PADDING.value))
        )
    
   
