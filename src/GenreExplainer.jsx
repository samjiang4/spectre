import React, { useState } from 'react';

// Channel counts and pooling sizes follow GenreCNN in backend/app.py.
const cnnBlocks = [
  {
    inputChannels: 1,
    outputChannels: 16,
    frequencyRows: 64,
    description:
      'The first block scans the spectrogram with 16 learned filters. Each filter looks at a small 3 × 3 patch of frequency and time.',
  },
  {
    inputChannels: 16,
    outputChannels: 32,
    frequencyRows: 32,
    description:
      'The second block combines the previous feature maps into 32 new maps, learning patterns from the first block’s responses.',
  },
  {
    inputChannels: 32,
    outputChannels: 64,
    frequencyRows: 16,
    description:
      'The third block builds 64 feature maps from those patterns. Each response now depends on a wider region of the original spectrogram.',
  },
  {
    inputChannels: 64,
    outputChannels: 128,
    frequencyRows: 8,
    description:
      'The fourth block produces 128 feature maps. These learned features are summarized and passed to the genre classifier.',
  },
];

function GenreExplainer({ result }) {
  const [selectedBlock, setSelectedBlock] = useState(0);
  const currentBlock = cnnBlocks[selectedBlock];

  return (
    <details className="similarity-details genre-details">
      <summary>
        How is the genre predicted?
        <span className="details-chevron" aria-hidden="true">⌄</span>
      </summary>

      <section className="genre-explainer" aria-label="GenreCNN architecture explained">
        <div className="map-topline">
          <span><i /> INSIDE THE CNN</span>
          <span className="map-badge">MODEL ARCHITECTURE</span>
        </div>

        <div className="cnn-input">
          <div className="spectrogram-art" aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <span
                key={index}
                style={{ '--bar': `${25 + ((index * 37) % 76)}%` }}
              />
            ))}
          </div>
          <div>
            <span className="cnn-kicker">01 / AUDIO TO IMAGE</span>
            <h3>A picture of sound</h3>
            <p>
              Mono audio at 22,050 Hz → 5-second chunks → normalized mel spectrograms
              with 128 frequency bands. Short chunks are padded with silence.
            </p>
          </div>
        </div>

        <div className="cnn-section-label">
          <span>02 / FOUR CONVOLUTION BLOCKS</span>
          <span>Select a block to explore</span>
        </div>
        <div className="cnn-blocks" aria-label="Explore CNN blocks">
          {cnnBlocks.map((block, index) => (
            <button
              className="cnn-block"
              key={block.outputChannels}
              type="button"
              aria-pressed={selectedBlock === index}
              onClick={() => setSelectedBlock(index)}
            >
              <span className="cnn-block-number">BLOCK 0{index + 1}</span>
              <span className="feature-stack" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <strong>{block.outputChannels}<small> maps</small></strong>
              <span className="cnn-block-shape">
                {block.inputChannels} → {block.outputChannels} channels
              </span>
            </button>
          ))}
        </div>

        <div className="cnn-block-detail" aria-live="polite">
          <h3>
            Block {selectedBlock + 1}
            <span>
              {currentBlock.inputChannels} → {currentBlock.outputChannels} channels
            </span>
          </h3>
          <p>{currentBlock.description}</p>
          <div className="cnn-operations">
            <span>3 × 3 convolution</span>
            <b>→</b>
            <span>Batch norm</span>
            <b>→</b>
            <span>ReLU</span>
            <b>→</b>
            <span>2 × 2 max pool</span>
          </div>
          <p className="cnn-pool-note">
            Each block halves the frequency and time dimensions with max pooling.
            After this block: {currentBlock.frequencyRows} frequency rows.
          </p>
        </div>

        <div className="cnn-output">
          <span className="cnn-kicker">03 / FEATURES TO GENRE</span>
          <h3>128 features. 10 possible genres.</h3>
          <p>
            Adaptive average pooling summarizes each feature map into one value.
            The model flattens these 128 values and uses a linear layer to produce
            10 genre scores. Softmax converts them into probabilities for each chunk.
          </p>
          <div className="cnn-head">
            <span>Average pool</span>
            <b>→</b>
            <span>128 features</span>
            <b>→</b>
            <span>10 scores</span>
            <b>→</b>
            <span>Softmax</span>
          </div>
          <p className="cnn-pool-note">
            Dropout (30%) helps during training; it is disabled when predicting.
          </p>
        </div>

        <div className="cnn-vote">
          <span className="cnn-kicker">04 / THE FINAL PREDICTION</span>
          <p>
            Each chunk votes for its highest-scoring genre. The genre with the most
            votes wins. Confidence is the average probability of that winning genre
            across all chunks.
          </p>
          {result && (
            <div className="cnn-live-result">
              <strong>{result.genre}</strong>
              <span>
                {result.chunks} chunks · {Math.round(result.confidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>

        <p className="map-footnote">
          Based on this project’s GenreCNN. The spectrogram artwork is illustrative;
          it does not show live model activations.
        </p>
      </section>
    </details>
  );
}

export default GenreExplainer;
