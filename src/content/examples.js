// These compact exercises are authored for this textbook, not lecture quotations.
// Эти краткие примеры созданы для учебника и не являются цитатами из лекций.
export const examples = {
  derivatives: {
    formula: String.raw`f(x)=3x^2-4x+5,\qquad f'(x)=6x-4`,
    code: `def f(x):\n    return 3*x*x - 4*x + 5\n\nx, h = 2.0, 1e-5\nslope = (f(x + h) - f(x)) / h\nprint(round(slope, 3))  # 8.0`,
    quiz: { type: 'number', answer: 8, tolerance: 0.001 },
  },
  graph: {
    formula: String.raw`L=(ab+c)d,\quad \frac{\partial L}{\partial a}=bd,\quad \frac{\partial L}{\partial c}=d`,
    code: `a, b, c, d = 2.0, -3.0, 10.0, -2.0\ne = a*b\nf = e+c\nloss = f*d\nda, db, dc, dd = b*d, a*d, d, f\nprint(loss, da, db, dc, dd)\n# -8.0 6.0 -4.0 -2.0 4.0`,
    quiz: { type: 'order', answer: [2, 0, 1] },
  },
  backward: {
    formula: String.raw`\frac{d\tanh x}{dx}=1-\tanh^2x,\qquad \frac{d(a+a)}{da}=2`,
    code: `import torch\na = torch.tensor(3.0, requires_grad=True)\nb = a + a\nb.backward()\nprint(a.grad.item())  # 2.0\n\n# Local rule for addition / Локальное правило сложения:\n# left.grad += out.grad\n# right.grad += out.grad`,
    quiz: { type: 'fix', answer: 1 },
  },
  training: {
    formula: String.raw`L=\sum_{i=1}^{N}(\hat y_i-y_i)^2,\qquad \theta\leftarrow\theta-\eta\nabla_\theta L`,
    code: `w, target, lr = 0.0, 3.0, 0.1\nfor step in range(30):\n    loss = (w - target)**2\n    grad = 2*(w - target)\n    w -= lr*grad\nprint(round(w, 3))  # 2.996`,
    quiz: { type: 'order', answer: [1, 3, 0, 2] },
  },
  counts: {
    formula: String.raw`P(j\mid i)=\frac{N_{ij}}{\sum_{k=1}^{V}N_{ik}}`,
    code: `from collections import Counter\nwords = ['ana', 'ann']\ncounts = Counter()\nfor word in words:\n    chars = '.' + word + '.'\n    counts.update(zip(chars, chars[1:]))\nprint(counts[('a', 'n')])  # 2`,
    quiz: { type: 'number', answer: 2, tolerance: 0 },
  },
  sampling: {
    formula: String.raw`x_{t+1}\sim P(\cdot\mid x_t),\qquad \sum_{j=1}^{V}P(j\mid i)=1`,
    code: `import torch\ncounts = torch.tensor([[1., 3.], [2., 2.]])\nprobs = counts / counts.sum(1, keepdim=True)\nassert torch.allclose(probs.sum(1), torch.ones(2))\ng = torch.Generator().manual_seed(42)\nnext_id = torch.multinomial(probs[0], 1, generator=g)\nprint(probs[0].tolist())  # [0.25, 0.75]`,
    quiz: { type: 'fix', answer: 2 },
  },
  likelihood: {
    formula: String.raw`L=-\frac{1}{N}\sum_{t=1}^{N}\ln p_t,\qquad P_\alpha(j\mid i)=\frac{N_{ij}+\alpha}{\sum_k N_{ik}+\alpha V}`,
    code: `import math\nprobabilities = [0.5, 0.25]\nloss = -sum(map(math.log, probabilities))/len(probabilities)\nprint(round(loss, 4))  # 1.0397`,
    quiz: { type: 'number', answer: 0.693147, tolerance: 0.001 },
  },
  'neural-bigram': {
    formula: String.raw`z=xW,\quad p_j=\frac{e^{z_j-m}}{\sum_k e^{z_k-m}},\quad m=\max_k z_k`,
    code: `import torch\nimport torch.nn.functional as F\nW = torch.tensor([[1., 2.], [3., 4.]])\nids = torch.tensor([1, 0])\none_hot = F.one_hot(ids, num_classes=2).float()\nassert torch.equal(one_hot @ W, W[ids])\nprint(W[ids].softmax(dim=1))`,
    quiz: { type: 'choice', answer: 0 },
  },
  context: {
    formula: String.raw`(x_{t-K},\ldots,x_{t-1})\longmapsto x_t,\qquad X\in\mathbb{N}^{N\times K}`,
    code: `context = [0, 0, 0]\nfor token in [1, 2, 1, 0]:\n    print(context, token)\n    context = context[1:] + [token]\n# [0, 0, 0] 1\n# [0, 0, 1] 2\n# [0, 1, 2] 1\n# [1, 2, 1] 0`,
    quiz: { type: 'number', answer: 4, tolerance: 0 },
  },
  embeddings: {
    formula: String.raw`E=C[X],\quad h=\tanh(\operatorname{flatten}(E)W_1+b_1),\quad z=hW_2+b_2`,
    code: `import torch\nC = torch.arange(10.).view(5, 2)\nX = torch.tensor([[0, 1, 2], [2, 3, 4]])\nE = C[X]\nflat = E.reshape(2, 6)\nprint(tuple(E.shape), tuple(flat.shape))\n# (2, 3, 2) (2, 6)`,
    quiz: { type: 'choice', answer: 1 },
  },
  optimization: {
    formula: String.raw`L_B=-\frac{1}{B}\sum_{i=1}^{B}\ln p_{i,y_i},\qquad \theta_{t+1}=\theta_t-\eta\nabla L_B`,
    code: `import torch\nimport torch.nn.functional as F\nlogits = torch.tensor([[1000., 1001.]], requires_grad=True)\ny = torch.tensor([1])\nloss = F.cross_entropy(logits, y)\nloss.backward()\nprint(round(loss.item(), 4))  # 0.3133`,
    quiz: { type: 'fix', answer: 0 },
  },
  evaluation: {
    formula: String.raw`L_{\mathrm{split}}=-\frac{1}{N_{\mathrm{split}}}\sum_{i=1}^{N_{\mathrm{split}}}\ln p_\theta(y_i\mid x_i)`,
    code: `import random\nwords = ['ana', 'ben', 'cy', 'dan', 'eva',\n         'fox', 'gus', 'hal', 'ivy', 'jay']\nrandom.Random(42).shuffle(words)\ntrain, val, test = words[:8], words[8:9], words[9:]\nassert not (set(train) & set(val))\nassert not (set(train) & set(test))\nprint(len(train), len(val), len(test))  # 8 1 1`,
    quiz: { type: 'match', answer: [1, 2, 0] },
  },
  initialization: {
    formula: String.raw`p_j=1/V\quad\Longrightarrow\quad L=-\ln(1/V)=\ln V`,
    code: `import math\nV = 27\nprint(round(math.log(V), 4))  # 3.2958\n# A reference, not a target after training.\n# Ориентир, а не цель после обучения.`,
    quiz: { type: 'number', answer: 3.295837, tolerance: 0.001 },
  },
  saturation: {
    formula: String.raw`h=\tanh(a),\quad h'=1-h^2,\qquad W_{ij}\sim\mathcal{N}(0,g^2/n_{\mathrm{in}})`,
    code: `import math\nfor a in [0., 1., 3.]:\n    h = math.tanh(a)\n    print(a, round(h, 4), round(1-h*h, 4))\n# 0.0 0.0 1.0\n# 1.0 0.7616 0.42\n# 3.0 0.9951 0.0099`,
    quiz: { type: 'choice', answer: 2 },
  },
  batchnorm: {
    formula: String.raw`\hat x=\frac{x-\mu_B}{\sqrt{v_B+\epsilon}},\quad y=\gamma\hat x+\beta`,
    code: `import torch\nx = torch.tensor([[1., 3.], [3., 7.]])\nmean = x.mean(0, keepdim=True)\nvar = x.var(0, unbiased=False, keepdim=True)\nxhat = (x-mean)/torch.sqrt(var+1e-5)\nprint(xhat.round())  # [[-1, -1], [1, 1]]`,
    quiz: { type: 'match', answer: [2, 0, 1] },
  },
  diagnostics: {
    formula: String.raw`r=\log_{10}\frac{\operatorname{std}(\Delta W)}{\operatorname{std}(W)},\qquad \Delta W=-\eta\nabla_W L`,
    code: `import math\nweight_std, grad_std, lr = 0.2, 0.01, 0.1\nratio = math.log10(lr*grad_std/weight_std)\nprint(round(ratio, 3))  # -2.301`,
    quiz: { type: 'number', answer: -2.30103, tolerance: 0.002 },
  },
  'tensor-gradients': {
    formula: String.raw`Y=XW+b,\quad dX=dY\,W^T,\quad dW=X^T dY,\quad db=\sum_i dY_i`,
    code: `import torch\nX = torch.tensor([[1., 2.], [3., 4.]])\ndY = torch.ones(2, 3)\ndW = X.T @ dY\ndb = dY.sum(0)\nprint(dW.tolist(), db.tolist())\n# [[4., 4., 4.], [6., 6., 6.]] [2., 2., 2.]`,
    quiz: { type: 'fix', answer: 1 },
  },
  bessel: {
    formula: String.raw`\mu=\frac{1}{n}\sum_i x_i,\quad v_c=\frac{1}{n-c}\sum_i(x_i-\mu)^2,\quad c\in\{0,1\}`,
    code: `import torch\nx = torch.tensor([1., 3.])\nprint(x.var(unbiased=False).item())  # 1.0\nprint(x.var(unbiased=True).item())   # 2.0\n# Match the forward convention in the backward pass.\n# В backward сохраняйте соглашение из forward.`,
    quiz: { type: 'number', answer: 2, tolerance: 0 },
  },
  'crossentropy-grad': {
    formula: String.raw`\frac{\partial L}{\partial z_{ij}}=\frac{p_{ij}-\mathbf{1}[j=y_i]}{B}`,
    code: `import torch\nlogits = torch.zeros(1, 3)\ny = torch.tensor([1])\ndlogits = logits.softmax(1)\ndlogits[torch.arange(1), y] -= 1\ndlogits /= len(y)\nprint(dlogits)  # [[1/3, -2/3, 1/3]]`,
    quiz: { type: 'number', answer: -2 / 3, tolerance: 0.001 },
  },
  'batchnorm-grad': {
    formula: String.raw`dx_i=\gamma r\left(g_i-\overline{g}-\hat x_i\frac{\sum_j g_j\hat x_j}{n-c}\right),\quad r=(v_c+\epsilon)^{-1/2}`,
    code: `import torch\nx = torch.tensor([1., 2., 4.], dtype=torch.float64, requires_grad=True)\ng = torch.tensor([1., -1., 2.], dtype=torch.float64)\nc, eps = 1, 1e-5\nr = (x.var(unbiased=True)+eps).rsqrt()\nxhat = (x-x.mean())*r\n(xhat*g).sum().backward()\ndx = r*(g-g.mean()-xhat*(g*xhat).sum()/(len(x)-c))\nassert torch.allclose(dx, x.grad)`,
    quiz: { type: 'choice', answer: 0 },
  },
  modules: {
    formula: String.raw`f(x)=f_m(f_{m-1}(\cdots f_1(x))),\qquad \theta=\bigcup_{k=1}^{m}\theta_k`,
    code: `import torch\nfrom torch import nn\nmodel = nn.Sequential(nn.Linear(6, 8), nn.Tanh(), nn.Linear(8, 3))\nx = torch.zeros(4, 6)\nprint(tuple(model(x).shape))  # (4, 3)\nprint(sum(p.numel() for p in model.parameters()))  # 83`,
    quiz: { type: 'order', answer: [1, 2, 0] },
  },
  hierarchy: {
    formula: String.raw`(B,T,C)\longrightarrow(B,T/2,2C),\qquad R_\ell=2^\ell`,
    code: `import torch\nx = torch.arange(16).reshape(1, 8, 2)\ngrouped = x.reshape(1, 4, 4)\nprint(grouped[0, 0].tolist())  # [0, 1, 2, 3]\nassert grouped.shape == (1, 4, 4)`,
    quiz: { type: 'number', answer: 3, tolerance: 0 },
  },
  'shape-debug': {
    formula: String.raw`\mu_c=\frac{1}{BT}\sum_{b=1}^{B}\sum_{t=1}^{T}x_{btc},\quad \mu\in\mathbb{R}^{1\times1\times C}`,
    code: `import torch\nx = torch.arange(24.).reshape(2, 3, 4)\nmean = x.mean((0, 1), keepdim=True)\nvar = x.var((0, 1), unbiased=False, keepdim=True)\nassert mean.shape == (1, 1, 4)\ny = (x-mean)/torch.sqrt(var+1e-5)\nassert y.shape == x.shape`,
    quiz: { type: 'fix', answer: 2 },
  },
  experiments: {
    formula: String.raw`\overline{L}_k=\frac{1}{m}\sum_{i=1}^{m}L_{km+i}`,
    code: `losses = [3., 1., 2., 2., 1., 1.]\nm = 2\nsmoothed = [sum(losses[i:i+m])/m\n            for i in range(0, len(losses), m)]\nprint(smoothed)  # [2.0, 2.0, 1.0]`,
    quiz: { type: 'choice', answer: 1 },
  },
  sequence: {
    formula: String.raw`X_{b,t}=s_{i_b+t},\quad Y_{b,t}=s_{i_b+t+1},\quad z\in\mathbb{R}^{B\times T\times V}`,
    code: `tokens = [4, 1, 7, 2, 9]\nT = 4\nx, y = tokens[:T], tokens[1:T+1]\nprint(x, y)  # [4, 1, 7, 2] [1, 7, 2, 9]\nassert x[1:] == y[:-1]`,
    quiz: { type: 'choice', answer: 0 },
  },
  attention: {
    formula: String.raw`A=\operatorname{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}+M\right),\qquad O=AV`,
    code: `import torch\nT = 4\nscores = torch.zeros(T, T)\nmask = torch.tril(torch.ones(T, T)).bool()\nweights = scores.masked_fill(~mask, float('-inf')).softmax(-1)\nprint(weights[-1])  # [0.25, 0.25, 0.25, 0.25]\nassert torch.count_nonzero(weights.triu(1)) == 0`,
    quiz: { type: 'number', answer: 3, tolerance: 0 },
  },
  transformer: {
    formula: String.raw`u=x+\operatorname{MHA}(\operatorname{LN}(x)),\quad y=u+\operatorname{FFN}(\operatorname{LN}(u))`,
    code: `import torch\nfrom torch import nn\nx = torch.randn(2, 4, 8)\nln = nn.LayerNorm(8)\nffn = nn.Sequential(nn.Linear(8, 32), nn.ReLU(), nn.Linear(32, 8))\ny = x + ffn(ln(x))\nassert y.shape == x.shape`,
    quiz: { type: 'match', answer: [2, 0, 1] },
  },
  generation: {
    formula: String.raw`P(x_{1:N})=\prod_{t=1}^{N}P(x_t\mid x_{<t}),\qquad x_{t+1}\sim\operatorname{softmax}(z_t)`,
    code: `import torch\ncontext = torch.tensor([[0, 1, 2, 3, 4]])\nblock_size = 3\nvisible = context[:, -block_size:]\nlogits = torch.zeros(1, 1, 6)\ng = torch.Generator().manual_seed(42)\nnext_id = torch.multinomial(logits[:, -1, :].softmax(-1), 1, generator=g)\ncontext = torch.cat((context, next_id), dim=1)\nassert visible.tolist() == [[2, 3, 4]]\nassert context.shape == (1, 6)`,
    quiz: { type: 'order', answer: [2, 0, 3, 1] },
  },
  unicode: {
    formula: String.raw`\text{text}\xrightarrow{\mathrm{UTF\!\!-\!8}}(b_1,\ldots,b_n),\qquad b_i\in\{0,\ldots,255\}`,
    code: `text = 'é'\nraw = text.encode('utf-8')\nprint(ord(text), list(raw))  # 233 [195, 169]\nassert raw.decode('utf-8') == text`,
    quiz: { type: 'number', answer: 2, tolerance: 0 },
  },
  bpe: {
    formula: String.raw`(a^*,b^*)=\arg\max_{(a,b)}\operatorname{count}(a,b),\qquad V=256+K`,
    code: `from collections import Counter\nids = list(b'banana')\ncounts = Counter(zip(ids, ids[1:]))\npair = max(counts, key=counts.get)\nnew_ids, i = [], 0\nwhile i < len(ids):\n    if tuple(ids[i:i+2]) == pair:\n        new_ids.append(256)\n        i += 2\n    else:\n        new_ids.append(ids[i])\n        i += 1\nprint(new_ids)  # [98, 256, 256, 97]`,
    quiz: { type: 'number', answer: 258, tolerance: 0 },
  },
  encoding: {
    formula: String.raw`\operatorname{decode}(\operatorname{encode}(s))=s`,
    code: `vocab = {i: bytes([i]) for i in range(256)}\nvocab[256] = vocab[97] + vocab[110]\nids = [98, 256, 256, 97]\nraw = b''.join(vocab[i] for i in ids)\nprint(raw.decode('utf-8'))  # banana`,
    quiz: { type: 'choice', answer: 1 },
  },
  'tokenizer-design': {
    formula: String.raw`E\in\mathbb{R}^{V\times d},\quad W_{\mathrm{out}}\in\mathbb{R}^{d\times V},\quad N_{\mathrm{untied}}=2Vd`,
    code: `V, d = 256, 64\nbefore = 2*V*d\nafter = 2*(V+1)*d\nprint(after-before)  # 128\n# Untied embedding and output matrices; biases excluded.\n# Раздельные матрицы embedding и выхода; без bias.`,
    quiz: { type: 'match', answer: [1, 2, 0] },
  },
};
