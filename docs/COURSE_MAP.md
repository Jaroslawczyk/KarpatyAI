# Course map / Карта курса

The supplied transcripts determine the order. Main text is an editorial adaptation, not an attributed quotation. Original captions remain available in the lesson source accordions.

Порядок определяется приложенными расшифровками. Основной текст — редакционный пересказ, а не цитаты автора. Исходные субтитры доступны в раскрывающихся блоках уроков.

## 1. micrograd — 1.txt

### Производная: как меняется результат / Derivatives: how the output changes

- Route: `#/micrograd/derivatives`
- Source: `1.txt`, 0:00–19:11
- Concepts / Понятия: Конечная разность; Локальный наклон; Частная производная / Finite differences; Local slope; Partial derivatives
- Practice / Практика: Сравнить численный и аналитический наклон при x = −1. / Compare numerical and analytical slopes at x = −1.

### Вычислительный граф и цепное правило / Computation graphs and the chain rule

- Route: `#/micrograd/graph`
- Source: `1.txt`, 19:11–52:52
- Concepts / Понятия: Value; Вычислительный граф; Цепное правило / Value; Computation graph; Chain rule
- Practice / Практика: Вручную найти влияние c на L и проверить его изменением входа. / Calculate the effect of c on L and check it by perturbing the input.

### Автоматический backward / Automating the backward pass

- Route: `#/micrograd/backward`
- Source: `1.txt`, 52:52–1:43:55
- Concepts / Понятия: tanh; Топологический порядок; Накопление градиентов / tanh; Topological order; Gradient accumulation
- Practice / Практика: Проверить накопление на выражении a*a + a. / Check accumulation for a*a + a.

### От нейрона к обучению сети / From neurons to a training loop

- Route: `#/micrograd/training`
- Source: `1.txt`, 1:43:55–end / конец
- Concepts / Понятия: MLP; Функция потерь; Градиентный спуск / MLP; Loss function; Gradient descent
- Practice / Практика: Понять, почему знак и величина шага важны. / Understand why the sign and size of an update matter.

### Original chapters / Главы оригинала

- 0:00 — intro
- 0:29 — micrograd overview
- 8:09 — derivative of a simple function with one input
- 14:15 — derivative of a function with multiple inputs
- 19:11 — starting the core Value object of micrograd and its visualization
- 32:11 — manual backpropagation example #1: simple expression
- 51:10 — preview of a single optimization step
- 52:52 — manual backpropagation example #2: a neuron
- 1:09:05 — implementing the backward function for each operation
- 1:17:36 — implementing the backward function for a whole expression graph
- 1:22:32 — fixing a backprop bug when one node is used multiple times
- 1:27:05 — breaking up a tanh, exercising with more operations
- 1:39:33 — doing the same thing but in PyTorch: comparison
- 1:43:55 — building out a neural net library (multi-layer perceptron) in micrograd
- 1:51:08 — creating a tiny dataset, writing the loss function
- 1:58:01 — collecting all of the parameters of the neural net
- 2:01:18 — doing gradient descent optimization manually, training the network
- 2:14:03 — summary of what we learned, how to go towards modern neural nets
- 2:16:50 — walkthrough of the full code of micrograd on github
- 2:21:13 — real stuff: diving into PyTorch, finding their backward pass for tanh
- 2:24:42 — conclusion
- 2:25:22 — outtakes :)

## 2. bigram — 2.txt

### Биграммы: обучаем модель подсчётом / Bigrams: learning by counting

- Route: `#/bigram/counts`
- Source: `2.txt`, 0:00–24:03
- Concepts / Понятия: Биграмма; Матрица счётчиков; Маркер границы / Bigram; Count matrix; Boundary marker
- Practice / Практика: Вручную проверить одну строку матрицы счётчиков. / Manually verify one row of the count matrix.

### Выборка и правила broadcasting / Sampling and broadcasting

- Route: `#/bigram/sampling`
- Source: `2.txt`, 24:03–50:14
- Concepts / Понятия: Multinomial sampling; Seed; Broadcasting / Multinomial sampling; Seed; Broadcasting
- Practice / Практика: Проверить распределение первой строки без доверия к одному случайному исходу. / Check a distribution without trusting one random draw.

### Оцениваем модель: NLL и сглаживание / Measuring quality: NLL and smoothing

- Route: `#/bigram/likelihood`
- Source: `2.txt`, 50:14–1:03:00
- Concepts / Понятия: Log likelihood; Средний NLL; Сглаживание / Log likelihood; Mean NLL; Smoothing
- Practice / Практика: Увидеть, как псевдосчётчик спасает невстречавшийся переход. / See how a pseudocount rescues an unseen transition.

### Та же биграмма через нейросеть / The same bigram, as a neural network

- Route: `#/bigram/neural-bigram`
- Source: `2.txt`, 1:03:00–end / конец
- Concepts / Понятия: One-hot; Logits; Softmax / One-hot; Logits; Softmax
- Practice / Практика: Проверить инвариантность softmax к общему сдвигу. / Verify that softmax is invariant to a common shift.

### Original chapters / Главы оригинала

- 0:00 — intro
- 3:06 — reading and exploring the dataset
- 6:25 — exploring the bigrams in the dataset
- 9:24 — counting bigrams in a python dictionary
- 12:48 — counting bigrams in a 2D torch tensor ("training the model")
- 18:21 — visualizing the bigram tensor
- 20:56 — deleting spurious (S) and (E) tokens in favor of a single . token
- 24:03 — sampling from the model
- 36:20 — efficiency! vectorized normalization of the rows, tensor broadcasting
- 50:14 — loss function (the negative log likelihood of the data under our model)
- 1:00:50 — model smoothing with fake counts
- 1:03:00 — PART 2: the neural network approach: intro
- 1:05:27 — creating the bigram dataset for the neural net
- 1:10:01 — feeding integers into neural nets? one-hot encodings
- 1:13:54 — the "neural net": one linear layer of neurons implemented with matrix multiplication
- 1:18:46 — transforming neural net outputs into probabilities: the softmax
- 1:26:17 — summary, preview to next steps, reference to micrograd
- 1:35:52 — vectorized loss
- 1:38:40 — backward and update, in PyTorch
- 1:42:59 — putting everything together
- 1:47:54 — note 1: one-hot encoding really just selects a row of the next Linear layer's weight matrix
- 1:50:20 — note 2: model smoothing as regularization loss
- 1:54:36 — sampling from the neural net
- 1:56:20 — conclusion

## 3. mlp — 3.txt

### Из последовательности в обучающие пары / From sequences to training pairs

- Route: `#/mlp/context`
- Source: `3.txt`, 0:00–12:21
- Concepts / Понятия: Окно контекста; Общие параметры; X и Y / Context window; Shared parameters; X and Y
- Practice / Практика: Построить окна длины 2 для последовательности [1, 2, 0]. / Build windows of length 2 for [1, 2, 0].

### Эмбеддинги и скрытый слой / Embeddings and the hidden layer

- Route: `#/mlp/embeddings`
- Source: `3.txt`, 12:21–32:52
- Concepts / Понятия: Embedding lookup; Reshape / view; Скрытое представление / Embedding lookup; Reshape / view; Hidden representation
- Practice / Практика: Проследить конкретные значения через lookup и reshape. / Track actual values through lookup and reshape.

### Устойчивая cross-entropy и minibatch / Stable cross-entropy and minibatches

- Route: `#/mlp/optimization`
- Source: `3.txt`, 32:52–53:22
- Concepts / Понятия: Cross-entropy; Minibatch; Learning rate / Cross-entropy; Minibatch; Learning rate
- Practice / Практика: Проверить, что общий сдвиг больших logits не меняет loss. / Check that shifting large logits does not change loss.

### Train, validation, test / Train, validation, test

- Route: `#/mlp/evaluation`
- Source: `3.txt`, 53:22–end / конец
- Concepts / Понятия: Разделение данных; Переобучение; Гиперпараметры / Data splits; Overfitting; Hyperparameters
- Practice / Практика: Проверить разбиение до создания окон. / Verify splits before building windows.

### Original chapters / Главы оригинала

- 0:00 — intro
- 1:48 — Bengio et al. 2003 (MLP language model) paper walkthrough
- 9:07 — (re-)building our training dataset
- 12:21 — implementing the embedding lookup table
- 18:38 — implementing the hidden layer + internals of torch.Tensor: storage, views
- 29:17 — implementing the output layer
- 29:58 — implementing the negative log likelihood loss
- 32:22 — summary of the full network
- 32:52 — introducing F.cross_entropy and why
- 37:58 — implementing the training loop, overfitting one batch
- 41:30 — training on the full dataset, minibatches
- 45:41 — finding a good initial learning rate
- 53:22 — splitting up the dataset into train/val/test splits and why
- 1:00:51 — experiment: larger hidden layer
- 1:05:28 — visualizing the character embeddings
- 1:07:17 — experiment: larger embedding size
- 1:11:50 — summary of our final code, conclusion
- 1:13:24 — sampling from the model
- 1:14:59 — google collab (new!!) notebook advertisement

## 4. activations — 4.txt

### Что говорит начальная функция потерь / What the initial loss tells you

- Route: `#/activations/initialization`
- Source: `4.txt`, 0:00–13:04
- Concepts / Понятия: Начальные logits; Равномерный baseline; Масштаб выхода / Initial logits; Uniform baseline; Output scale
- Practice / Практика: Сравнить равномерный baseline для двух словарей. / Compare uniform baselines for two vocabularies.

### Насыщение tanh и масштаб весов / Tanh saturation and weight scale

- Route: `#/activations/saturation`
- Source: `4.txt`, 13:04–40:43
- Concepts / Понятия: Насыщение; Fan-in; Gain / Saturation; Fan-in; Gain
- Practice / Практика: Проверить симметрию производной tanh. / Check the symmetry of the tanh derivative.

### BatchNorm: обучение и инференс / BatchNorm: training and inference

- Route: `#/activations/batchnorm`
- Source: `4.txt`, 40:43–1:18:40
- Concepts / Понятия: Batch statistics; γ и β; Running statistics / Batch statistics; γ and β; Running statistics
- Practice / Практика: Проверить центрирование каждого признака. / Verify feature-wise centering.

### Диагностика: активации, градиенты, обновления / Inspect activations, gradients, and updates

- Route: `#/activations/diagnostics`
- Source: `4.txt`, 1:18:40–end / конец
- Concepts / Понятия: Гистограммы; Update:data ratio; Статистика по слоям / Histograms; Update:data ratio; Layer statistics
- Practice / Практика: Увидеть влияние learning rate на диагностическое отношение. / See how learning rate affects the diagnostic ratio.

### Original chapters / Главы оригинала

- 0:00 — intro
- 1:25 — starter code
- 4:24 — fixing the initial loss
- 13:04 — fixing the saturated tanh
- 27:53 — calculating the init scale: “Kaiming init”
- 40:43 — batch normalization
- 1:03:07 — batch normalization: summary
- 1:04:55 — real example: resnet50 walkthrough
- 1:14:14 — summary of the lecture
- 1:18:40 — just kidding: part2: PyTorch-ifying the code
- 1:26:52 — viz #1: forward pass activations statistics
- 1:30:59 — viz #2: backward pass gradient statistics
- 1:32:09 — the fully linear case of no non-linearities
- 1:36:20 — viz #3: parameter activation and gradient statistics
- 1:39:55 — viz #4: update:data ratio over time
- 1:46:05 — bringing back batchnorm, looking at the visualizations
- 1:51:34 — summary of the lecture for real this time

## 5. backprop — 5.txt

### Цепное правило для тензоров / The chain rule for tensors

- Route: `#/backprop/tensor-gradients`
- Source: `5.txt`, 0:00–1:05:20
- Concepts / Понятия: Матричные производные; Обратное broadcasting; retain_grad / Matrix derivatives; Undoing broadcasting; retain_grad
- Practice / Практика: Проверить ручную производную линейного слоя. / Verify a linear layer’s manual derivative.

### Дисперсия и поправка Бесселя / Variance and Bessel’s correction

- Route: `#/backprop/bessel`
- Source: `5.txt`, 1:05:20–1:26:31
- Concepts / Понятия: Дисперсия; Поправка Бесселя; Согласованность forward/backward / Variance; Bessel’s correction; Forward/backward consistency
- Practice / Практика: Проверить связь двух оценок дисперсии. / Verify the relationship between two variance estimates.

### Короткий backward для cross-entropy / A short cross-entropy backward pass

- Route: `#/backprop/crossentropy-grad`
- Source: `5.txt`, 1:26:31–1:36:42
- Concepts / Понятия: Softmax derivative; p − y; Mean reduction / Softmax derivative; p − y; Mean reduction
- Practice / Практика: Сравнить компактную формулу с autograd. / Compare the compact formula with autograd.

### Backward BatchNorm и проверка целой сети / BatchNorm backward and the whole network

- Route: `#/backprop/batchnorm-grad`
- Source: `5.txt`, 1:36:42–end / конец
- Concepts / Понятия: Связанные примеры; Компактный BatchNorm backward; Проверка градиентов / Coupled examples; Compact BatchNorm backward; Gradient checking
- Practice / Практика: Проверить формулу при другом соглашении дисперсии. / Check the formula with the other variance convention.

### Original chapters / Главы оригинала

- 0:00 — intro: why you should care & fun history
- 7:26 — starter code
- 13:03 — exercise 1: backproping the atomic compute graph
- 1:05:20 — brief digression: bessel’s correction in batchnorm
- 1:26:31 — exercise 2: cross entropy loss backward pass
- 1:36:42 — exercise 3: batch norm layer backward pass
- 1:50:05 — exercise 4: putting it all together
- 1:54:25 — outro

## 6. wavenet — 6.txt

### Слои как переиспользуемые модули / Layers as reusable modules

- Route: `#/wavenet/modules`
- Source: `6.txt`, 0:00–17:12
- Concepts / Понятия: Module; Sequential; Состояние слоя / Module; Sequential; Layer state
- Practice / Практика: Проверить автоматический сбор параметров. / Verify automatic parameter collection.

### Объединяем контекст по два / Combine context two at a time

- Route: `#/wavenet/hierarchy`
- Source: `6.txt`, 17:12–37:47
- Concepts / Понятия: Иерархия; FlattenConsecutive; Поле восприятия / Hierarchy; FlattenConsecutive; Receptive field
- Practice / Практика: Проверить, что попарное объединение сохраняет все значения. / Verify that grouping preserves all values.

### Тихая ошибка BatchNorm в трёх измерениях / A silent three-dimensional BatchNorm bug

- Route: `#/wavenet/shape-debug`
- Source: `6.txt`, 37:47–46:07
- Concepts / Понятия: Оси редукции; NLC и NCL; Тихие ошибки форм / Reduction axes; NLC and NCL; Silent shape errors
- Practice / Практика: Сравнить правильные статистики с прежней двумерной реализацией. / Compare the intended statistics with the old implementation.

### Сравниваем архитектуры честно / Compare architectures fairly

- Route: `#/wavenet/experiments`
- Source: `6.txt`, 46:07–end / конец
- Concepts / Понятия: Экспериментальный журнал; Сопоставимый baseline; Dilated causal convolution / Experiment log; Comparable baseline; Dilated causal convolution
- Practice / Практика: Проверить, что сглаживание сохраняет общее среднее полных групп. / Check that averaging full equal-size groups preserves the global mean.

### Original chapters / Главы оригинала

- 0:00 — intro
- 1:43 — starter code walkthrough
- 6:58 — let’s fix the learning rate plot
- 9:19 — pytorchifying our code: layers, containers, torch.nn, fun bugs
- 17:12 — overview: WaveNet
- 19:35 — dataset bump the context size to 8
- 19:59 — re-running baseline code on block_size 8
- 21:41 — implementing WaveNet
- 37:47 — training the WaveNet: first pass
- 38:55 — fixing batchnorm1d bug
- 45:25 — re-training WaveNet with bug fix
- 46:07 — scaling up our WaveNet
- 46:59 — experimental harness
- 47:44 — WaveNet but with “dilated causal convolutions”
- 51:37 — torch.nn
- 52:29 — the development process of building deep neural nets
- 54:21 — going forward
- 55:27 — improve on my loss! how far can we improve a WaveNet on this data?

## 7. gpt — 7.txt

### Текст, блоки и предсказание следующего токена / Text, blocks, and next-token prediction

- Route: `#/gpt/sequence`
- Source: `7.txt`, 0:00–42:18
- Concepts / Понятия: Token IDs; Сдвиг targets; B, T, C / Token IDs; Shifted targets; B, T, C
- Practice / Практика: Явно перечислить задачи внутри одного блока. / Enumerate the prediction tasks inside one block.

### Self-attention: взвешенный обмен информацией / Self-attention: a weighted exchange

- Route: `#/gpt/attention`
- Source: `7.txt`, 42:18–1:22:02
- Concepts / Понятия: Query / key / value; Причинная маска; Scaled dot-product / Query / key / value; Causal mask; Scaled dot-product
- Practice / Практика: Проверить причинность каждой строки attention. / Verify causality in every attention row.

### Из голов внимания в Transformer-блок / From attention heads to a Transformer block

- Route: `#/gpt/transformer`
- Source: `7.txt`, 1:22:02–1:42:45
- Concepts / Понятия: Multi-head attention; Residual; Pre-norm LayerNorm / Multi-head attention; Residual; Pre-norm LayerNorm
- Practice / Практика: Проверить, что FFN не переносит информацию между позициями. / Check that FFN does not transfer information between positions.

### GPT: генерация и границы предобучения / GPT generation and the limits of pretraining

- Route: `#/gpt/generation`
- Source: `7.txt`, 1:42:45–end / конец
- Concepts / Понятия: Decoder-only; Авторегрессия; Pretraining / fine-tuning / Decoder-only; Autoregression; Pretraining / fine-tuning
- Practice / Практика: Проверить длину истории и видимого контекста. / Check full-history and visible-context lengths.

### Original chapters / Главы оригинала

- 0:00 — intro: ChatGPT, Transformers, nanoGPT, Shakespeare
- 7:57 — reading and exploring the data
- 9:31 — tokenization, train/val split
- 14:32 — data loader: batches of chunks of data
- 22:15 — simplest baseline: bigram language model, loss, generation
- 34:57 — training the bigram model
- 38:02 — port our code to a script
- 42:18 — version 1: averaging past context with for loops, the weakest form of aggregation
- 47:12 — the trick in self-attention: matrix multiply as weighted aggregation
- 51:59 — version 2: using matrix multiply
- 54:48 — version 3: adding softmax
- 58:27 — minor code cleanup
- 1:00:22 — positional encoding
- 1:02:05 — THE CRUX OF THE VIDEO: version 4: self-attention
- 1:11:41 — note 1: attention as communication
- 1:12:51 — note 2: attention has no notion of space, operates over sets
- 1:13:41 — note 3: there is no communication across batch dimension
- 1:14:18 — note 4: encoder blocks vs. decoder blocks
- 1:15:40 — note 5: attention vs. self-attention vs. cross-attention
- 1:16:57 — note 6: "scaled" self-attention. why divide by sqrt(head_size)
- 1:19:13 — inserting a single self-attention block to our network
- 1:22:02 — multi-headed self-attention
- 1:24:28 — feedforward layers of transformer block
- 1:26:51 — residual connections
- 1:32:52 — layernorm (and its relationship to our previous batchnorm)
- 1:37:51 — scaling up the model! creating a few variables. adding dropout
- 1:42:45 — encoder vs. decoder vs. both (?) Transformers
- 1:46:24 — super quick walkthrough of nanoGPT, batched multi-headed self-attention
- 1:48:59 — back to ChatGPT, GPT-3, pretraining vs. finetuning, RLHF
- 1:54:32 — conclusions

## 8. tokenizer — 8.txt

### Символ — не байт и не токен / A character is not a byte or a token

- Route: `#/tokenizer/unicode`
- Source: `8.txt`, 0:00–23:55
- Concepts / Понятия: Кодовая точка; UTF-8; Байтовый словарь / Code point; UTF-8; Byte vocabulary
- Practice / Практика: Сравнить символьную и байтовую длины. / Compare character and byte lengths.

### BPE: обучаем правила слияния / BPE: learn merge rules

- Route: `#/tokenizer/bpe`
- Source: `8.txt`, 23:55–42:48
- Concepts / Понятия: Соседние пары; Merge rank; Отдельное обучение токенизатора / Adjacent pairs; Merge rank; Separate tokenizer training
- Practice / Практика: Проверить неперекрывающиеся замены. / Verify non-overlapping replacement.

### Encode, decode и границы regex / Encode, decode, and regex boundaries

- Route: `#/tokenizer/encoding`
- Source: `8.txt`, 42:48–1:18:30
- Concepts / Понятия: Encode / decode; Порядок слияний; Regex pre-tokenization / Encode / decode; Merge order; Regex pre-tokenization
- Practice / Практика: Показать, почему байты объединяются до декодирования. / Show why bytes must be joined before decoding.

### Специальные токены и размер словаря / Special tokens and vocabulary size

- Route: `#/tokenizer/tokenizer-design`
- Source: `8.txt`, 1:18:30–end / конец
- Concepts / Понятия: Special tokens; Размер словаря; Совместимость модели / Special tokens; Vocabulary size; Model compatibility
- Practice / Практика: Оценить цену расширения словаря. / Estimate the parameter cost of vocabulary expansion.

### Original chapters / Главы оригинала

- 0:00 — intro: Tokenization, GPT-2 paper, tokenization-related issues
- 5:56 — tokenization by example in a Web UI (tiktokenizer)
- 14:59 — strings in Python, Unicode code points
- 18:17 — Unicode byte encodings, ASCII, UTF-8, UTF-16, UTF-32
- 22:52 — daydreaming: deleting tokenization
- 23:55 — Byte Pair Encoding (BPE) algorithm walkthrough
- 27:07 — starting the implementation
- 28:38 — counting consecutive pairs, finding most common pair
- 30:38 — merging the most common pair
- 34:58 — training the tokenizer: adding the while loop, compression ratio
- 39:25 — tokenizer/LLM diagram: it is a completely separate stage
- 42:48 — decoding tokens to strings
- 48:23 — encoding strings to tokens
- 57:37 — regex patterns to force splits across categories
- 1:11:38 — tiktoken library intro, differences between GPT-2/GPT-4 regex
- 1:15:02 — GPT-2 encoder.py released by OpenAI walkthrough
- 1:18:30 — special tokens, tiktoken handling of, GPT-2/GPT-4 differences
- 1:25:33 — minbpe exercise time! write your own GPT-4 tokenizer
- 1:28:47 — sentencepiece library intro, used to train Llama 2 vocabulary
- 1:43:31 — how to set vocabulary set? revisiting gpt.py transformer
- 1:48:13 — training new tokens, example of prompt compression
- 1:50:03 — multimodal [image, video, audio] tokenization with vector quantization
- 1:51:45 — revisiting and explaining the quirks of LLM tokenization
- 2:10:21 — final recommendations

## Source integrity / Целостность источников

- `0.txt`: 10814 bytes; SHA-256 `24230ede81cdf2e3d176041acdeab8e203a72c1ccdb570a1faf86d892427fedf`
- `1.txt`: 137095 bytes; SHA-256 `916d1535e53b7de8570f5297d531a6bf96acca2638ea9fd5ebd1e190e8305702`
- `2.txt`: 111395 bytes; SHA-256 `b46fc44ca6573e9d4e1cd970f7a4513b27cf26e8002b15baa0ca8c69037676f1`
- `3.txt`: 72777 bytes; SHA-256 `fd8e0789295c32df504bc6492054488cb466d6cd67355911fab9352860d416e5`
- `4.txt`: 123138 bytes; SHA-256 `56369a3a613eab2ff8b364b1ef4ea89ec498c3361a90aa1cffd96da77895d2dc`
- `5.txt`: 116245 bytes; SHA-256 `fe0b48e6b2261751606376cb497afc0e9a1592c5d1ecde124e4a6b1d845b35d3`
- `6.txt`: 59478 bytes; SHA-256 `8d01fe90ce038580b6d7b7afdecdafba5e1282c7971d9dd256adb08b5d4ea78b`
- `7.txt`: 120177 bytes; SHA-256 `2f4c169db46c166ea3fe43ed320fa6219cc1bd5aa7fa30a9f2db3148fd48f257`
- `8.txt`: 139948 bytes; SHA-256 `f990465a3ffdbe4fdad1c8eecb85e5fabf62a2a1d4153eb3de0f9073f9c70789`
