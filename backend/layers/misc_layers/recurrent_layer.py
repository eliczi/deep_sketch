from layers.layer import Layer
import os
from enum import Enum


class RecurrentType(Enum):
    LSTM = "LSTM"
    GRU = "GRU"
    RNN = "RNN"


class RecurrentLayer(Layer):
    path = os.path.join('.', 'assets', 'recurrent_layer.svg')
    #default values
    DEFAULT_RECURRENT_TYPE = RecurrentType.LSTM
    DEFAULT_INPUT_SIZE = 10
    DEFAULT_HIDDEN_SIZE = 32
    DEFAULT_NUM_LAYERS = 1
    DEFAULT_BIAS = True
    DEFAULT_BATCH_FIRST = False
    DEFAULT_DROPOUT = 0 
    DEFAULT_BIDIRECTIONAL = False

    def __init__(self, recurrent_type: RecurrentType = DEFAULT_RECURRENT_TYPE, input_size: int = DEFAULT_INPUT_SIZE, hidden_size: int = DEFAULT_HIDDEN_SIZE, num_layers: int = DEFAULT_NUM_LAYERS, bias: bool = DEFAULT_BIAS, batch_first: bool = DEFAULT_BATCH_FIRST, dropout: float = DEFAULT_DROPOUT, bidirectional: bool = DEFAULT_BIDIRECTIONAL):
        super().__init__()
        self.recurrent_type = recurrent_type
        self.input_size = input_size
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.bias = bias
        self.batch_first = batch_first
        self.dropout = dropout
        self.bidirectional = bidirectional


    @classmethod
    def from_params(cls, params):
        return cls(
            recurrent_type=params.get('recurrent_type', cls.DEFAULT_RECURRENT_TYPE),
            input_size=params.get('input_size', cls.DEFAULT_INPUT_SIZE),
            hidden_size=params.get('hidden_size', cls.DEFAULT_HIDDEN_SIZE),
            num_layers=params.get('num_layers', cls.DEFAULT_NUM_LAYERS),
            bias=params.get('bias', cls.DEFAULT_BIAS),
            batch_first=params.get('batch_first', cls.DEFAULT_BATCH_FIRST),
            dropout=params.get('dropout', cls.DEFAULT_DROPOUT),
            bidirectional=params.get('bidirectional', cls.DEFAULT_BIDIRECTIONAL)
        )
