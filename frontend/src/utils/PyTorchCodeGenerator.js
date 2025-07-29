class PyTorchCodeGenerator {
  constructor(networkModel) {
    this.network = networkModel;
  }

  //enum for convolutional types
  ConvolutionalType = {
    CONV1D: "Conv1d",
    CONV2D: "Conv2d",
    CONV3D: "Conv3d",
    CONVTRANSPOSE1D: "ConvTranspose1d",
    CONVTRANSPOSE2D: "ConvTranspose2d",
    CONVTRANSPOSE3D: "ConvTranspose3d",
    LAZYCONV1D: "LazyConv1d",
    LAZYCONV2D: "LazyConv2d",
    LAZYCONV3D: "LazyConv3d",
    LAZYCONVTRANSPOSE1D: "LazyConvTranspose1d",
    LAZYCONVTRANSPOSE2D: "LazyConvTranspose2d",
    LAZYCONVTRANSPOSE3D: "LazyConvTranspose3d"
  }
  PoolingType = {
    MAXPOOL1D: "MaxPool1d",
    MAXPOOL2D: "MaxPool2d",
    MAXPOOL3D: "MaxPool3d",
    AVGPOOL1D: "AvgPool1d",
    AVGPOOL2D: "AvgPool2d",
    AVGPOOL3D: "AvgPool3d"
  }
  LayerGenerators = {
    ConvolutionalLayer: (layer, idx) =>
      `        self.layer${idx} = nn.${this.ConvolutionalType[layer.params.conv_type]}(${layer.params.in_channels}, ${layer.params.out_channels}, ${layer.params.kernel_size}, ${layer.params.stride}, ${layer.params.padding}, ${layer.params.dilation}, ${layer.params.groups}, ${layer.params.bias}, '${layer.params.padding_mode.toLowerCase()}')`,
    DenseLayer: (layer, idx) =>
      `        self.layer${idx} = nn.Linear(${layer.params.in_features}, ${layer.params.out_features})`,
    PoolingLayer: (layer, idx) =>
      this.generatePoolingLayer(layer, idx),
    FlatteningLayer: (layer, idx) =>
      `        self.layer${idx} = nn.Flatten()`,
    DropoutLayer: (layer, idx) =>
      `        self.layer${idx} = nn.Dropout(${layer.params.rate})`,
    EmbeddingLayer: (layer, idx) =>
      `        self.layer${idx} = nn.Embedding(${layer.params.num_embeddings}, ${layer.params.embedding_dim}, ${layer.params.padding_idx && ',' || ''} ${layer.params.max_norm || 'None'}, ${layer.params.norm_type || 2}, ${layer.params.scale_grad_by_freq || 'False'}, ${layer.params.sparse || 'False'})`,
    AttentionLayer: (layer, idx) =>
      `        self.layer${idx} = nn.MultiheadAttention(${layer.params.embed_dim}, ${layer.params.num_heads}, ${layer.params.dropout || 0.0}, ${layer.params.bias !== false}, ${layer.params.add_bias_kv || false}, ${layer.params.add_zero_attn || false}, ${layer.params.kdim || 'None'}, ${layer.params.vdim || 'None'}, ${layer.params.batch_first || false})`,
    NormalizationLayer: (layer, idx) =>
      this.generateNormalizationLayer(layer, idx),
    DropoutLayer: (layer, idx) =>
      `        self.layer${idx} = nn.Dropout(${layer.params.probability}, ${layer.params.inplace})`,
    RecurrentLayer: (layer, idx) =>
      this.generateRecurrentLayer(layer, idx),

  };

  generatePoolingLayer(layer, idx) {
    const poolingType = layer.params.pooling_type.charAt(0).toUpperCase() + layer.params.pooling_type.toLowerCase().slice(1);
    const poolDimension = layer.params.pool_dimension.charAt(0).toUpperCase() + layer.params.pool_dimension.toLowerCase().slice(1);
    const poolSize = layer.params.kernel_size;
    const stride = layer.params.stride;
    const padding = layer.params.padding;
    return `        self.layer${idx} = nn.${poolingType}${poolDimension}(${poolSize}, ${stride}, ${padding})`

  }
  generateNormalizationLayer(layer, idx) {
    const normalizationType = layer.params.normalization_type.charAt(0).toUpperCase() + layer.params.normalization_type.toLowerCase().slice(1);
    return `        self.layer${idx} = nn.${normalizationType}(120})`
  }
  generateRecurrentLayer(layer, idx) {
    const recurrentType = layer.params.recurrent_type;
    return `        self.layer${idx} = nn.${recurrentType}(${layer.params.input_size}, ${layer.params.hidden_size}, ${layer.params.num_layers}, ${layer.params.bias}, ${layer.params.batch_first}, ${layer.params.dropout}, ${layer.params.bidirectional})`
  }
  generateLayer(layer, idx) {
    const generator = this.LayerGenerators[layer.type];
    if (generator) {
      return generator(layer, idx);
    }

  }
  generateCode() {
    let code = [
      "import torch",
      "import torch.nn as nn",
      "",
      "class GeneratedNet(nn.Module):",
      "    def __init__(self):",
      "        super().__init__()"
    ];

    this.network.layers.forEach((layer, idx) => {
      code.push(this.generateLayer(layer, idx));
    });
    code.push("");
    code.push("    def forward(self, x):");
    const forwardCode = this.generateForwardMethod();
    code.push(...forwardCode);
    code.push("        return x");
    code.push("");
    code.push("model = GeneratedNet()");
    return code.join("\n");
  }

  generateForwardMethod() {
    const layers = this.network.layers;
    const connections = this.network.connections;
    if (!connections || connections.length === 0) {
      return layers.map((layer, idx) => `        x = self.layer${idx}(x)`);
    }
    const layerMap = new Map();
    layers.forEach((layer, idx) => {
      layerMap.set(layer.id, idx);
    });
    const dependencies = new Map();
    layers.forEach(layer => {
      dependencies.set(layer.id, new Set());
    });

    connections.forEach(connection => {
      const fromLayer = parseInt(connection.sourceId);
      const toLayer = parseInt(connection.targetId);
      if (dependencies.has(fromLayer) && dependencies.has(toLayer)) {
        dependencies.get(toLayer).add(fromLayer);
      }
    });

    const sortedLayers = [];
    const visited = new Set();
    const tempVisited = new Set();
    const visit = (layerId) => {
      if (tempVisited.has(layerId)) {
        return;
      }
      if (visited.has(layerId)) {
        return;
      }

      tempVisited.add(layerId);
      const deps = dependencies.get(layerId) || new Set();
      deps.forEach(depId => {
        visit(depId);
      });
      tempVisited.delete(layerId);
      visited.add(layerId);
      sortedLayers.push(layerId);
    };

    layers.forEach(layer => {
      if (!visited.has(layer.id)) {
        visit(layer.id);
      }
    });
    return sortedLayers.map(layerId => {
      const layerIdx = layerMap.get(layerId);
      return `        x = self.layer${layerIdx}(x)`;
    });
  }
}

export default PyTorchCodeGenerator;