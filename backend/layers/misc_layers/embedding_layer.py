from enum import Enum
from layers.layer import Layer
import os

class InitializerType(Enum):
    UNIFORM = "uniform"
    NORMAL = "normal"
    ZEROS = "zeros"
    ONES = "ones"
    GLOROT_UNIFORM = "glorot_uniform"
    GLOROT_NORMAL = "glorot_normal"

class RegularizerType(Enum):
    NONE = "None"
    L1 = "l1"
    L2 = "l2"
    L1_L2 = "l1_l2"

class ConstraintType(Enum):
    NONE = "None"
    MAX_NORM = "max_norm"
    NON_NEG = "non_neg"
    UNIT_NORM = "unit_norm"

class EmbeddingLayer(Layer):
    path = os.path.join('.', 'assets', 'embedding_layer.svg')
    
    DEFAULT_NUM_EMBEDDINGS = 1000
    DEFAULT_EMBEDDING_DIM = 100
    DEFAULT_PADDING_IDX = None
    DEFAULT_MAX_NORM = None
    DEFAULT_NORM_TYPE = 2.0
    DEFAULT_SCALE_GRAD_BY_FREQ = False
    DEFAULT_SPARSE = False

    def __init__(
        self,
        num_embeddings: int = DEFAULT_NUM_EMBEDDINGS,
        embedding_dim: int = DEFAULT_EMBEDDING_DIM,
        padding_idx: int = DEFAULT_PADDING_IDX,
        max_norm: float = DEFAULT_MAX_NORM,
        norm_type: float = DEFAULT_NORM_TYPE,
        scale_grad_by_freq: bool = DEFAULT_SCALE_GRAD_BY_FREQ,
        sparse: bool = DEFAULT_SPARSE
    ):
        super().__init__()
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim
        self.padding_idx = padding_idx
        self.max_norm = max_norm
        self.norm_type = norm_type
        self.scale_grad_by_freq = scale_grad_by_freq
        self.sparse = sparse
        self.input_shape = None
        self.output_shape = None

    @classmethod
    def from_params(cls, params):
        return cls(
            num_embeddings=params.get('num_embeddings', cls.DEFAULT_NUM_EMBEDDINGS),
            embedding_dim=params.get('embedding_dim', cls.DEFAULT_EMBEDDING_DIM),
            padding_idx=params.get('padding_idx', cls.DEFAULT_PADDING_IDX),
            max_norm=params.get('max_norm', cls.DEFAULT_MAX_NORM),
            norm_type=params.get('norm_type', cls.DEFAULT_NORM_TYPE),
            scale_grad_by_freq=params.get('scale_grad_by_freq', cls.DEFAULT_SCALE_GRAD_BY_FREQ),
            sparse=params.get('sparse', cls.DEFAULT_SPARSE),
      
        )

    def get_config(self):
        return {
            'num_embeddings': self.num_embeddings,
            'embedding_dim': self.embedding_dim,
            'padding_idx': self.padding_idx,
            'max_norm': self.max_norm,
            'norm_type': self.norm_type,
            'scale_grad_by_freq': self.scale_grad_by_freq,
            'sparse': self.sparse
        }
    

    