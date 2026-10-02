export const modules = [
  {
    id: 'micrograd',
    file: 1,
    topics: ['derivatives', 'graph', 'backward', 'training'],
    starts: ['0:00', '19:11', '52:52', '1:43:55'],
    lab: 'derivative',
  },
  {
    id: 'bigram',
    file: 2,
    topics: ['counts', 'sampling', 'likelihood', 'neural-bigram'],
    starts: ['0:00', '24:03', '50:14', '1:03:00'],
    lab: 'bigram',
  },
  {
    id: 'mlp',
    file: 3,
    topics: ['context', 'embeddings', 'optimization', 'evaluation'],
    starts: ['0:00', '12:21', '32:52', '53:22'],
    lab: 'embedding',
  },
  {
    id: 'activations',
    file: 4,
    topics: ['initialization', 'saturation', 'batchnorm', 'diagnostics'],
    starts: ['0:00', '13:04', '40:43', '1:18:40'],
    lab: 'activation',
  },
  {
    id: 'backprop',
    file: 5,
    topics: ['tensor-gradients', 'bessel', 'crossentropy-grad', 'batchnorm-grad'],
    starts: ['0:00', '1:05:20', '1:26:31', '1:36:42'],
    lab: 'gradient',
  },
  {
    id: 'wavenet',
    file: 6,
    topics: ['modules', 'hierarchy', 'shape-debug', 'experiments'],
    starts: ['0:00', '17:12', '37:47', '46:07'],
    lab: 'tree',
  },
  {
    id: 'gpt',
    file: 7,
    topics: ['sequence', 'attention', 'transformer', 'generation'],
    starts: ['0:00', '42:18', '1:22:02', '1:42:45'],
    lab: 'attention',
  },
  {
    id: 'tokenizer',
    file: 8,
    topics: ['unicode', 'bpe', 'encoding', 'tokenizer-design'],
    starts: ['0:00', '23:55', '42:48', '1:18:30'],
    lab: 'bpe',
  },
];

export const topics = modules.flatMap((module, moduleIndex) =>
  module.topics.map((id, index) => ({
    id,
    module: module.id,
    moduleIndex,
    index,
    file: module.file,
    start: module.starts[index],
    end: module.starts[index + 1] || null,
    lab: module.lab,
  })),
);
export const topicById = Object.fromEntries(topics.map((topic) => [topic.id, topic]));
// Some explanations revisit a chapter outside the primary chronological range.
// Некоторые объяснения возвращаются к главе за пределами основного диапазона.
export const relatedChapters = {
  likelihood: ['1:50:20'],
  saturation: ['1:32:09'],
  hierarchy: ['46:59', '47:44'],
  experiments: ['6:58'],
  generation: ['22:15'],
};
export const toSeconds = (time) =>
  time.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
export const route = (topic) => `#/${topic.module}/${topic.id}`;
