import test from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './helpers/read-text.js';

const css = readText('../src/styles.css', import.meta.url);
const app = readText('../src/app.js', import.meta.url);
const html = readText('../index.html', import.meta.url);

test('the application viewport is fixed and the active page owns vertical scrolling', () => {
  assert.match(css, /html, body\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.app-shell\s*\{[^}]*height:\s*100dvh/s);
  assert.match(css, /\.app-shell\s*>\s*main\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.app-shell\s*>\s*\.topbar,[\s\S]*?flex:\s*0 0 auto/);
  assert.match(html, /<main id="homeView">/);
  assert.match(html, /<main id="countdownView" hidden>/);
});

test('page navigation stores and restores home scroll inside the home view', () => {
  assert.match(app, /function activePageElement\(\)/);
  assert.match(app, /function resetActivePageScroll\(\)/);
  assert.match(app, /\$\('homeView'\)\.scrollTop = homeScrollTop/);
  assert.doesNotMatch(app, /window\.scroll(To|By)\(/);
  assert.match(app, /page\.scrollBy\(\{ top: -pageScrollDistance\(page\.clientHeight\)/);
  assert.match(app, /page\.scrollTo\(\{ top: page\.scrollHeight/);
});

test('preferred countdowns and the expanded analog clock use restrained dimensions', () => {
  const layout = css.slice(css.lastIndexOf('/* ===== v2.5.4:'));
  assert.match(layout, /#bestCountdown\s*\{[^}]*font-size:\s*clamp\(1\.55rem, 3vw, 2\.35rem\)/s);
  assert.match(layout, /\.clock-preferred-count\s*\{[^}]*font-size:\s*clamp\(1\.45rem, 2\.8vw, 2\.35rem\)/s);
  assert.match(layout, /--clock-big:\s*clamp\(9rem, min\(28vh, 24vw\), 18rem\)/);
});

test('card collections share spacing and corner geometry tokens', () => {
  const layout = css.slice(css.lastIndexOf('/* ===== v2.5.4:'));
  assert.match(layout, /--card-gap:/);
  assert.match(layout, /\.page-cards,[\s\S]*?gap:\s*var\(--card-gap\)/);
  assert.match(layout, /--card-radius:/);
  assert.match(layout, /\.page-card,[\s\S]*?border-radius:\s*var\(--card-radius\)/);
  assert.match(layout, /body \.page-card,[\s\S]*?padding:\s*var\(--card-inset\)/);
  assert.match(layout, /body \.voluntary-item \{ padding:\s*var\(--card-inset-compact\)/);
});

test('night prayer cards retain their individual identity under the Qiyam-ul-Layl category', () => {
  assert.match(app, /\['qiyam', 'tahajjud', 'witr', 'tarawih'\]\.includes\(event\.key\)/);
  assert.match(app, /'কিয়ামুল লাইল' : 'QIYAM-UL-LAYL'/);
  assert.match(app, /event\.key === 'qiyam' \? \(lang\(\) === 'bn' \? 'সাধারণ কিয়াম' : 'General Qiyam'\)/);
  assert.match(app, /slotName\(event\.key, event\.date\)/);
  assert.match(app, /data-mark-key="\$\{event\.key\}"/);
});
