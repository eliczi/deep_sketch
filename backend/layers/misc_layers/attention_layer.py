from layers.layer import Layer
import os


class AttentionLayer(Layer):
    path = os.path.join('.', 'assets', 'attention_layer.svg')
    
    DEFAULT_EMBED_DIM = 512
    DEFAULT_NUM_HEADS = 8
    DEFAULT_DROPOUT = 0.0
    DEFAULT_BIAS = True
    DEFAULT_ADD_BIAS_KV = False
    DEFAULT_ADD_ZERO_ATTN = False
    DEFAULT_KDIM = None
    DEFAULT_VDIM = None
    DEFAULT_BATCH_FIRST = False

    def __init__(
        self,
        embed_dim: int = DEFAULT_EMBED_DIM,
        num_heads: int = DEFAULT_NUM_HEADS,
        dropout: float = DEFAULT_DROPOUT,
        bias: bool = DEFAULT_BIAS,
        add_bias_kv: bool = DEFAULT_ADD_BIAS_KV,
        add_zero_attn: bool = DEFAULT_ADD_ZERO_ATTN,
        kdim: int = DEFAULT_KDIM,
        vdim: int = DEFAULT_VDIM,
        batch_first: bool = DEFAULT_BATCH_FIRST
    ):
        super().__init__()
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.dropout = dropout
        self.bias = bias
        self.add_bias_kv = add_bias_kv
        self.add_zero_attn = add_zero_attn
        self.kdim = kdim
        self.vdim = vdim
        self.batch_first = batch_first
        self.input_shape = None
        self.output_shape = None

    @classmethod
    def from_params(cls, params):
        return cls(
            embed_dim=params.get('embed_dim', cls.DEFAULT_EMBED_DIM),
            num_heads=params.get('num_heads', cls.DEFAULT_NUM_HEADS),
            dropout=params.get('dropout', cls.DEFAULT_DROPOUT),
            bias=params.get('bias', cls.DEFAULT_BIAS),
            add_bias_kv=params.get('add_bias_kv', cls.DEFAULT_ADD_BIAS_KV),
            add_zero_attn=params.get('add_zero_attn', cls.DEFAULT_ADD_ZERO_ATTN),
            kdim=params.get('kdim', cls.DEFAULT_KDIM),
            vdim=params.get('vdim', cls.DEFAULT_VDIM),
            batch_first=params.get('batch_first', cls.DEFAULT_BATCH_FIRST)
        )

    def get_config(self):
        return {
            'embed_dim': self.embed_dim,
            'num_heads': self.num_heads,
            'dropout': self.dropout,
            'bias': self.bias,
            'add_bias_kv': self.add_bias_kv,
            'add_zero_attn': self.add_zero_attn,
            'kdim': self.kdim,
            'vdim': self.vdim,
            'batch_first': self.batch_first
        }
