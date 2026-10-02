import { spawnSync } from 'node:child_process';
import { examples } from '../src/content/examples.js';

const python = process.argv[2] || 'python';
const runner = String.raw`
import contextlib, io, json, sys
examples = json.load(sys.stdin)
results = {}
for name, code in examples.items():
    stream = io.StringIO()
    try:
        compiled = compile(code, name + '.py', 'exec')
        with contextlib.redirect_stdout(stream):
            exec(compiled, {'__name__': '__main__'})
        results[name] = {'ok': True, 'output': stream.getvalue().strip()}
    except Exception as error:
        results[name] = {'ok': False, 'error': repr(error)}
print(json.dumps(results))
`;
const result = spawnSync(python, ['-c', runner], {
  input: JSON.stringify(
    Object.fromEntries(Object.entries(examples).map(([id, ex]) => [id, ex.code])),
  ),
  encoding: 'utf8',
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
});
if (result.error || result.status !== 0) {
  console.error(result.error?.message || result.stderr);
  process.exit(1);
}
const results = JSON.parse(result.stdout);
const outputs = {
  derivatives: '8.0',
  graph: '-8.0 6.0 -4.0 -2.0 4.0',
  backward: '2.0',
  training: '2.996',
  counts: '2',
  sampling: '[0.25, 0.75]',
  likelihood: '1.0397',
  context: '[0, 0, 0] 1\n[0, 0, 1] 2\n[0, 1, 2] 1\n[1, 2, 1] 0',
  embeddings: '(2, 3, 2) (2, 6)',
  optimization: '0.3133',
  evaluation: '8 1 1',
  initialization: '3.2958',
  saturation: '0.0 0.0 1.0\n1.0 0.7616 0.42\n3.0 0.9951 0.0099',
  diagnostics: '-2.301',
  'tensor-gradients': '[[4.0, 4.0, 4.0], [6.0, 6.0, 6.0]] [2.0, 2.0, 2.0]',
  bessel: '1.0\n2.0',
  modules: '(4, 3)\n83',
  hierarchy: '[0, 1, 2, 3]',
  experiments: '[2.0, 2.0, 1.0]',
  sequence: '[4, 1, 7, 2] [1, 7, 2, 9]',
  unicode: '233 [195, 169]',
  bpe: '[98, 256, 256, 97]',
  encoding: 'banana',
  'tokenizer-design': '128',
};
for (const [id, expected] of Object.entries(outputs)) {
  if (results[id].ok && results[id].output.replace(/\r\n/g, '\n') !== expected)
    results[id] = {
      ok: false,
      error: `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(results[id].output)}`,
    };
}
const failed = Object.entries(results).filter(([, value]) => !value.ok);
if (failed.length) {
  console.error(JSON.stringify(Object.fromEntries(failed), null, 2));
  process.exit(1);
}
console.log(
  `${Object.keys(results).length} Python examples executed; ${Object.keys(outputs).length} expected outputs verified; embedded assertions passed.`,
);
