// End-to-end tests against the demo page (index.html). Run with: yarn test
import {ClientFunction, Selector} from 'testcafe';

const PAGE = 'http://localhost:5174';

const clearStorage = ClientFunction(() => localStorage.clear());
const read = ClientFunction(locus => window.stateTagApp.$read(locus));
const write = ClientFunction((locus, value) => window.stateTagApp.$write(locus, value));
const addTag = ClientFunction(html => {
    const holder = document.createElement('div');
    holder.id = 'test-holder';
    holder.innerHTML = html;
    document.body.appendChild(holder);
});
const pressEscape = ClientFunction(() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'})));

const text = locus => Selector(`x-text-html[locus="${locus}"]`);

fixture`STA demo`
    .page`${PAGE}`
    .beforeEach(async t => {
        await clearStorage();
        await t.navigateTo(PAGE);
    });

test('state: tags read, inputs write, state persists, reset restores', async t => {
    await t.expect(text('msg.en').innerText).eql('This text is inside state.js.');

    await t.typeText(Selector('x-input[locus="msg.en"] input'), 'Hello from TestCafe', {replace: true});
    await t.expect(text('msg.en').innerText).eql('Hello from TestCafe');

    await t.wait(300).navigateTo(PAGE);
    await t.expect(text('msg.en').innerText).eql('Hello from TestCafe');

    await t.click(Selector('button').withText('reset state'));
    await t.expect(text('msg.en').innerText).eql('This text is inside state.js.');
});

test('api: one source feeds every tag, each with its own locus', async t => {
    await t.expect(Selector('x-text-html[service="api"][locus="en"]').innerText).eql('Hello');
    await t.expect(Selector('x-text-html[service="api"][locus="es"]').innerText).eql('Hola');
    await t.expect(Selector('x-text-html[service="api"][locus="fr"]').innerText).eql('Bonjour');
});

test('api: refresh="N" refetches every N seconds; no refresh means one request', async t => {
    const countRequests = ClientFunction(() =>
        performance.getEntriesByType('resource').filter(e => e.name.includes('TextHtml.json')).length);

    await t.expect(Selector('x-text-html[service="api"][locus="en"]').innerText).eql('Hello');
    await t.wait(1500);
    await t.expect(countRequests()).eql(1);

    await addTag('<x-text-html service="api" src="/HelloWorld/TextHtml.json" locus="fr" refresh="1"></x-text-html>');
    await t.wait(2600);
    await t.expect(countRequests()).gte(3);
    await t.expect(Selector('#test-holder').innerText).eql('Bonjour');
});

test('socket: connects, pushes timecast, global watcher writes state', async t => {
    // The demo label ends in &nbsp;, so match any whitespace.
    await t.expect(Selector('x-socket-status').innerText).match(/^Socket Status:\s+connected$/, {timeout: 8000});
    await t.expect(Selector('x-text-html[service="socket"][locus="stamp"]').innerText).match(/^\d{4}-\d\d-\d\dT/, {timeout: 5000});
    await t.expect(text('rolex').innerText).match(/^\d{4}-\d\d-\d\dT/);
});

test('nebula: writes reach every tag bound to the key', async t => {
    const value = 'nebula ' + Date.now();
    await t.typeText(Selector('x-input[service="nebula"] input'), value, {replace: true});
    await t.expect(Selector('x-text-html[service="nebula"]').innerText).eql(value, {timeout: 5000});
});

test('fail loud: an undeclared locus shows its error in the tag', async t => {
    await addTag('<x-text-html locus="msg.typo"></x-text-html>');
    await t.expect(Selector('#test-holder').innerText).contains('locus "msg.typo" is not declared');
});

test('undo: the pill cancels a delayed request', async t => {
    await t.click(Selector('x-progress-button button'));
    await t.expect(Selector('.sta-undo').visible).ok();
    await t.expect(text('hello').innerText).contains('waiting');

    await t.click(Selector('.sta-undo'));
    await t.expect(text('hello').innerText).eql('cancelled by undo');
    await t.expect(Selector('.sta-undo').exists).notOk();
});

test('modal: renders tags in its body and closes on Escape', async t => {
    await t.click(Selector('button').withText('Open modal with a tag inside'));
    await t.expect(Selector('.sta-modal-header').innerText).contains('Demo modal');
    await t.expect(Selector('.sta-modal-body x-input input').value).eql('This text is inside state.js.');

    await pressEscape();
    await t.expect(Selector('.sta-modal').exists).notOk();
});

test('i18n: switching language translates; a missing key shows the key', async t => {
    await t.expect(text('i18nDemo.greeting').innerText).eql('Hello');
    await t.expect(text('i18nDemo.untranslated').innerText).eql('not-translated-yet');

    const lang = Selector('x-lang select');
    await t.click(lang).click(lang.find('option').withText('ES - Español'));
    await t.expect(text('i18nDemo.greeting').innerText).eql('Hola');
    await t.expect(Selector('x-input[locus="form.name"] label').innerText).eql('Nombre');
});

test('formatters and badge', async t => {
    await t.expect(Selector('x-text-html[locus="form.amount"]').nth(0).innerText).eql('1,234,567.89');
    await t.expect(Selector('x-text-html[locus="form.amount"]').nth(2).innerText).eql('1.2m');

    await t.expect(Selector('x-badge').innerText).eql('3');
    await write('badges.inbox', 0);
    await t.expect(Selector('x-badge .sta-badge').exists).notOk();
    await t.expect(read('badges.inbox')).eql(0);
});
