export default {
  unicode: {
    title: 'A character is not a byte or a token',
    lead: 'Text must become numbers before reaching a model. A Unicode character, its UTF-8 bytes, and a language-model token are different representation levels.',
    technical:
      'The lecture begins with tokenizer behavior, then examines Python strings, Unicode code points, and encodings. ord gives a code-point number; encode("utf-8") gives bytes. UTF-8 represents a code point with one or more bytes, and a byte-level base vocabulary contains 256 values. This base covers arbitrary valid Unicode text but often yields long sequences, which BPE then shortens.',
    concepts: ['Code point', 'UTF-8', 'Byte vocabulary'],
    symbols:
      'text is a Unicode string; bᵢ is its i-th UTF-8 byte; n is the byte count; every bᵢ lies between 0 and 255. Byte, character, and token counts can differ.',
    why: 'Without this distinction, it is easy to misjudge context length or reconstruct text incorrectly.',
    mistakes: [
      'Equating character counts with token counts.',
      'Assuming every individual byte must decode into a valid UTF-8 character.',
    ],
    details:
      'Raw bytes avoid an enormous code-point vocabulary but lengthen sequences. Eliminating tokenization is discussed as a research direction, not an implemented BPE replacement here. A displayed character can itself consist of multiple code points.',
    summary: 'Distinguish text, code points, and bytes before studying how bytes become tokens.',
    codeNotes: [
      'Here é is the single code point U+00E9, encoded as two UTF-8 bytes.',
      'decode reconstructs text from the entire byte sequence.',
    ],
    quiz: {
      prompt: 'How many UTF-8 bytes encode é (U+00E9) in this example?',
      explanation: 'Two bytes: 195 and 169. Code point 233 is a different representation.',
    },
    practice: {
      goal: 'Compare character and byte lengths.',
      prepare: 'Python 3; strings "a", "é", and "猫".',
      steps: [
        'Print len(text) for each string.',
        'Print list(text.encode("utf-8")).',
        'Check decode(encode(text)) == text.',
      ],
      reason: 'Equal code-point lengths need not imply equal byte lengths.',
      result: 'Each string has one code point; byte lengths are 1, 2, and 3.',
      check: 'All three round-trip checks return True.',
      hint: 'len(text.encode("utf-8")) counts bytes.',
      solution: 'a: [97]; é: [195,169]; 猫: [231,140,171]. UTF-8 has variable length.',
    },
  },
  bpe: {
    title: 'BPE: learn merge rules',
    lead: 'Byte Pair Encoding replaces a frequent adjacent pair with a new token. Repeating the process trades a larger vocabulary for shorter sequences.',
    technical:
      'First turn text into bytes. Count adjacent pairs; the most frequent receives a new ID starting at 256. Replace its non-overlapping occurrences from left to right. Repeat while saving merge order and each new token’s byte content. Tokenizer training is a separate stage before LLM training; its data and algorithm are not Transformer weights.',
    concepts: ['Adjacent pairs', 'Merge rank', 'Separate tokenizer training'],
    symbols:
      '(a*,b*) is the most frequent adjacent pair; count(a,b) is its frequency; argmax chooses a maximizing pair; V is vocabulary size; K is the number of merges; 256 is the base byte count. Special tokens are excluded.',
    why: 'Merges shorten the sequences processed by attention while preserving byte reconstruction.',
    mistakes: [
      'Dropping a final unpaired token during traversal.',
      'Replacing overlapping occurrences simultaneously and consuming one token twice.',
    ],
    details:
      'For [a,a,a], statistics count two adjacent (a,a) pairs, but non-overlapping replacement yields [new,a]. Frequency ties need a defined rule. The laboratory chooses the first encountered pair and stops when no repeated pair remains; this is an explicit educational stopping rule.',
    summary:
      'BPE learns ordered merge rules and a vocabulary; the language model is trained on the resulting IDs afterwards.',
    codeNotes: [
      'In banana, an and na both occur twice; Counter traversal selects an first.',
      'The loop skips two input tokens only after a successful merge.',
    ],
    quiz: {
      prompt: 'What is the byte-level vocabulary size after two merges, excluding special tokens?',
      explanation: '256 base bytes + 2 new IDs = 258.',
    },
    practice: {
      goal: 'Verify non-overlapping replacement.',
      prepare: 'Python 3 and the example code.',
      steps: ['Change the input to b"aaa".', 'Count adjacent pairs.', 'Merge (97,97) into ID 256.'],
      reason: 'Pair frequency and the number of non-overlapping replacements can differ.',
      result: 'Frequency 2; output [256,97].',
      check: 'Token 256 decodes to two bytes 97, so the result still contains three a characters.',
      hint: 'Increase i by 2 after a match.',
      solution:
        'The first pair consumes positions 0 and 1. Position 2 remains; a consumed position cannot be reused in another replacement.',
    },
  },
  encoding: {
    title: 'Encode, decode, and regex boundaries',
    lead: 'Learning merges and applying them to new text are separate operations. Encoding follows learned ranks; decoding expands tokens back into bytes.',
    technical:
      'Decode joins the byte representations of all IDs before decoding UTF-8. Encode chooses the available pair whose learned merge occurred earliest, applies it, and repeats. It must not relearn frequencies for each new request. GPT tokenizers use regex to split text into pieces before BPE, restricting which boundaries merges can cross. The lecture compares these splits and examines the published GPT-2 encoder.',
    concepts: ['Encode / decode', 'Merge order', 'Regex pre-tokenization'],
    symbols:
      's is the original string; encode(s) is a token-ID sequence; decode reconstructs the string. The equality assumes a consistent lossless byte-level tokenizer and valid input text, not arbitrary token IDs.',
    why: 'If inference encoding differs from training, IDs no longer refer to the expected fragments.',
    mistakes: [
      'Choosing the new text’s most frequent pair instead of the earliest learned rank.',
      'Decoding each token to text before joining its bytes.',
    ],
    details:
      'One token may contain only part of a multibyte character. Arbitrary model-generated token sequences can produce invalid UTF-8; the lecture demonstrates replacement decoding. That does not contradict exact round-tripping of valid input text. Whitespace and category boundaries matter.',
    summary: 'Encode applies stored ranks; decode joins bytes before converting to text.',
    codeNotes: [
      'The vocabulary explicitly defines token 256 as bytes a and n.',
      'b"".join reconstructs the full stream before decode is called.',
    ],
    quiz: {
      prompt: 'Which pair should be merged first when encoding with a trained BPE?',
      options: [
        'The new text’s most frequent pair',
        'An available pair with the earliest learned rank',
        'The pair with the largest IDs',
      ],
      explanation:
        'Encoding follows stored merge order; frequencies were measured during tokenizer training.',
    },
    practice: {
      goal: 'Show why bytes must be joined before decoding.',
      prepare: 'Python 3 and bytes [195,169].',
      steps: [
        'Try decoding bytes([195]) alone as UTF-8.',
        'Join both bytes.',
        'Decode bytes([195,169]).',
      ],
      reason: 'A token boundary need not be a Unicode-character boundary.',
      result: 'One byte raises UnicodeDecodeError; both bytes yield é.',
      check: 'bytes([195,169]).decode("utf-8") == "é".',
      hint: 'Wrap the first attempt in try/except UnicodeDecodeError.',
      solution:
        '195 begins a two-byte sequence and requires continuation byte 169. Separate decoding breaks the valid sequence.',
    },
  },
  'tokenizer-design': {
    title: 'Special tokens and vocabulary size',
    lead: 'A tokenizer determines document boundaries, control markers, and model-table sizes as well as text compression. Its configuration affects the whole system.',
    technical:
      'The final section examines special tokens, minbpe, SentencePiece, and vocabulary-size tradeoffs. Larger vocabularies usually shorten sequences but enlarge embeddings and output layers; rare tokens may receive little training. Adding IDs requires coordinated model changes and training of new parameters. SentencePiece normalization and byte fallback require attention. Spelling, numeric, and multilingual quirks are connected to specific text segmentation.',
    concepts: ['Special tokens', 'Vocabulary size', 'Model compatibility'],
    symbols:
      'V is vocabulary size; d is embedding dimension; E is the V×d input table; W_out is the d×V output matrix; N_untied counts parameters in these two separate matrices. Biases and tied weights are excluded.',
    why: 'A trained model’s vocabulary cannot be replaced arbitrarily: IDs must match learned vectors and outputs.',
    mistakes: [
      'Interpreting user text as a special control token without an explicit policy.',
      'Calling demonstration BPE the exact tokenizer of a particular GPT model.',
    ],
    details:
      'The lecture briefly mentions prompt compression with new tokens and multimodal representations; full implementations remain outside its scope. Comparisons of GPT-2, GPT-4, tiktoken, and SentencePiece reflect the recording date. Exact compatibility requires a specific vocabulary, regex, ranks, special tokens, and normalization settings, not merely the BPE algorithm.',
    summary:
      'Tokenizer, vocabulary, and model parameters form one consistent system; BPE alone does not ensure compatibility.',
    codeNotes: [
      'The calculation assumes two independent matrices without biases.',
      'One new token adds d input and d output parameters: 128 total for d=64.',
    ],
    quiz: {
      prompt: 'Match each component to its role.',
      items: ['Ordinary BPE merge', 'Special token', 'Embedding'],
      options: [
        'Vector representation of an ID',
        'Combine adjacent fragments',
        'Structural stream marker',
      ],
      explanation:
        'Merges form text fragments, special tokens mark structure, and embeddings turn IDs into vectors.',
    },
    practice: {
      goal: 'Estimate the parameter cost of vocabulary expansion.',
      prepare: 'Python 3; two independent matrices, d = 128.',
      steps: [
        'Compare V=1000 and V=1100.',
        'Calculate 2*V*d for both.',
        'Find the added parameter count.',
      ],
      reason: 'Vocabulary choice affects model resources as well as text length.',
      result: '25600 added parameters, excluding biases.',
      check: '2*(1100−1000)*128 = 25600.',
      hint: 'Counting two independent tables would be wrong if the weights were tied.',
      solution:
        'The difference is 2·100·128. This exercise does not estimate compression quality, which depends on data and learned merges.',
    },
  },
};
