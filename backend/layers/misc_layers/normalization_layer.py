from layers.layer import Layer
import os
from enum import Enum
#normalization types

class NormalizationType(Enum):
    BATCH_NORMALIZATION = "Batch Normalization"
    LAYER_NORMALIZATION = "Layer Normalization"
    GROUP_NORMALIZATION = "Group Normalization"
    INSTANCE_NORMALIZATION = "Instance Normalization"


class NormalizationLayer(Layer):
    path = os.path.join('.', 'assets', 'normalization_layer.svg')

    DEFAULT_NORMALIZATION_TYPE = NormalizationType.BATCH_NORMALIZATION

    def __init__(self, normalization_type: NormalizationType = DEFAULT_NORMALIZATION_TYPE):
        super().__init__()
        self.normalization_type = normalization_type
         
    
    @classmethod
    def from_params(cls, params):
        norm_type = params.get('normalization_type', cls.DEFAULT_NORMALIZATION_TYPE)
        # Convert string to enum if needed
        if isinstance(norm_type, str):
            norm_type = NormalizationType[norm_type]
        return cls(normalization_type=norm_type)