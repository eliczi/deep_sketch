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
    
    DEFAULT_INPUT_DIM = 1000
    DEFAULT_OUTPUT_DIM = 100
    DEFAULT_INITIALIZER = InitializerType.UNIFORM
    DEFAULT_REGULARIZER = RegularizerType.NONE
    DEFAULT_CONSTRAINT = ConstraintType.NONE
    DEFAULT_MASK_ZERO = False
    DEFAULT_LORA_RANK = None

    def __init__(
        self,
        input_dim: int = DEFAULT_INPUT_DIM,
        output_dim: int = DEFAULT_OUTPUT_DIM,
        embeddings_initializer: InitializerType = DEFAULT_INITIALIZER,
        embeddings_regularizer: RegularizerType = DEFAULT_REGULARIZER,
        embeddings_constraint: ConstraintType = DEFAULT_CONSTRAINT,
        mask_zero: bool = DEFAULT_MASK_ZERO,
        lora_rank: int = DEFAULT_LORA_RANK,
        **kwargs
    ):
        super().__init__()
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.embeddings_initializer = embeddings_initializer
        self.embeddings_regularizer = embeddings_regularizer
        self.embeddings_constraint = embeddings_constraint
        self.mask_zero = mask_zero
        self.lora_rank = lora_rank
        self.input_shape = None
        self.output_shape = None
        # Store any additional kwargs
        self.extra_params = kwargs

    @classmethod
    def from_params(cls, params):
        # Convert string values to enum types
        initializer = params.get('embeddings_initializer', cls.DEFAULT_INITIALIZER.value)
        if isinstance(initializer, str):
            for init_type in InitializerType:
                if init_type.value == initializer:
                    initializer = init_type
                    break

        regularizer = params.get('embeddings_regularizer', cls.DEFAULT_REGULARIZER.value)
        if isinstance(regularizer, str):
            for reg_type in RegularizerType:
                if reg_type.value == regularizer:
                    regularizer = reg_type
                    break

        constraint = params.get('embeddings_constraint', cls.DEFAULT_CONSTRAINT.value)
        if isinstance(constraint, str):
            for const_type in ConstraintType:
                if const_type.value == constraint:
                    constraint = const_type
                    break

        return cls(
            input_dim=params.get('input_dim', cls.DEFAULT_INPUT_DIM),
            output_dim=params.get('output_dim', cls.DEFAULT_OUTPUT_DIM),
            embeddings_initializer=initializer,
            embeddings_regularizer=regularizer,
            embeddings_constraint=constraint,
            mask_zero=params.get('mask_zero', cls.DEFAULT_MASK_ZERO),
            lora_rank=params.get('lora_rank', cls.DEFAULT_LORA_RANK),
            **{k: v for k, v in params.items() if k not in {
                'input_dim', 'output_dim', 'embeddings_initializer',
                'embeddings_regularizer', 'embeddings_constraint',
                'mask_zero', 'lora_rank'
            }}
        )

    def get_config(self):
        return {
            'input_dim': self.input_dim,
            'output_dim': self.output_dim,
            'embeddings_initializer': self.embeddings_initializer.value,
            'embeddings_regularizer': self.embeddings_regularizer.value,
            'embeddings_constraint': self.embeddings_constraint.value,
            'mask_zero': self.mask_zero,
            'lora_rank': self.lora_rank
        }
    

    