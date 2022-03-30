import './App.css';
import { useState, useCallback, useEffect } from 'react';
import wordList from './wordlist';
import { sanitizeWord, scoreWord, validateWord } from './wordUtils';
export const INTMAX32 = 2 ** 32;
/**
 *
 * @param {number} i
 * @returns {number} another number
 */
export function squirrel3(i) {
  let n = (i + INTMAX32) % INTMAX32;
  n = Math.imul(n, 0xb5297a4d);
  n ^= n >>> 8;
  n += 0x68e31da4;
  n ^= n << 8;
  n = Math.imul(n, 0x1b56c4e9);
  n ^= n >>> 8;
  return (n + INTMAX32) % INTMAX32;
}
function getTarget() {
  const j = squirrel3(Math.floor(new Date().valueOf() / 86400000));
  let i = Math.floor(j % wordList.numWords);
  return wordList.list[i].toUpperCase() + '_';
}
const target = getTarget();
window.theWord = target;
/**
 *
 * @param {string} a
 * @param {string} b
 * @returns {[number, number]} number of positional matches, number of character matches
 */
function compareWords(a, b) {
  const max = Math.max(a.length, b.length);
  let exact = 0;
  let common = 0;
  let remainingA = new Map();
  let remainingB = new Map();
  for (let i = 0; i < max; i++) {
    if (a[i] === b[i]) {
      exact++;
    } else {
      a[i] && remainingA.set(a[i], (remainingA.get(a[i]) ?? 0) + 1);
      b[i] && remainingB.set(b[i], (remainingA.get(b[i]) ?? 0) + 1);
    }
  }
  Array.from(remainingA.entries()).forEach(([ak, av]) => {
    common += Math.min(av, remainingB.get(ak) ?? 0);
  });
  return [exact, common];
}

document.compareWords = compareWords;

function useInput(defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const cb = useCallback(
    (e) => {
      if (typeof e === 'string') {
        setValue(e);
      } else {
        setValue(e.target.value);
      }
    },
    [setValue]
  );
  return [value, cb];
}
function App() {
  const [guesses, setGuesses] = useState([]);
  const [text, setText] = useInput('');
  const [sanitized, setSanitized] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setSanitized(sanitizeWord(text) + '_');
  }, [text]);

  function handleChange(e) {
    setError('');
    setText(e);
  }
  return (
    <div className='App'>
      <br />
      <div style={{ color: 'red' }}>{error}</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setText('');
          if (validateWord(text)) {
            setGuesses([...guesses, sanitized]);
          } else {
            setError(`${sanitizeWord(text)} is not in the word list.`);
          }
        }}
      >
        <input value={text} onChange={handleChange} />
      </form>
      <br />
      History:
      <table style={{ margin: 'auto' }}>
        <thead>
          <tr>
            <th>Guess</th>
            <th>Position Matches</th>
            <th>Character Matches</th>
            <th>?</th>
          </tr>
        </thead>
        <tbody>
          {guesses.map((g, i) => {
            return (
              <tr key={i}>
                <td className={'guess'}>
                  <ColoredWord word={g} colors={scoreWord(sanitized, g)} />
                </td>
                {compareWords(target, g).map((a, j) => (
                  <td key={j}>{a}</td>
                ))}
                <td>{g === target && 'CONGRATULATIONS_'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ColoredWord({ word, colors }) {
  console.log({ word, colors });
  return (
    <>
      {Array.from(word).map((char, i) => (
        <span key={i} className={colors[i]}>
          {char}
        </span>
      ))}
    </>
  );
}

export default App;
