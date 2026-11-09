// Minimal structural styles for runtime tags. Injected first in <head> so the host page's CSS wins;
// every class is prefixed "sta-".
const CSS = `
.sta-field{display:flex;gap:.5em;align-items:center;margin-bottom:10px}
.sta-error{color:#b00020}
.sta-api-progress{position:fixed;top:0;left:0;width:100%;height:3px;z-index:2147483646;
  background:linear-gradient(90deg,transparent,#36A2EB,transparent);background-size:50% 100%;
  animation:sta-api-progress 1s linear infinite}
@keyframes sta-api-progress{0%{background-position:-50% 0}100%{background-position:150% 0}}
.sta-modal-backdrop{position:fixed;inset:0;z-index:2147483640;display:flex;align-items:flex-start;
  justify-content:center;padding-top:10vh;background:rgba(0,0,0,.5)}
.sta-modal{min-width:min(90vw,320px);max-width:90vw;max-height:80vh;overflow:auto;border-radius:8px;
  background:#fff;color:#222;box-shadow:0 10px 30px rgba(0,0,0,.3)}
.sta-modal-header{display:flex;justify-content:space-between;align-items:center;gap:1em;padding:12px 16px;
  border-bottom:1px solid #eee;font-weight:bold}
.sta-modal-close{border:none;background:none;font-size:1.4em;line-height:1;cursor:pointer}
.sta-modal-error{padding:8px 16px;white-space:pre-wrap;background:#f3d8d8;color:#6b3b3b}
.sta-modal-body{padding:16px}
.sta-undo{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483645;border:none;
  border-radius:50px;padding:.5rem 1rem;background:rgba(220,112,112,.9);color:#fff;font-size:1.2em;cursor:pointer}
.sta-progress-button{position:relative;overflow:hidden}
.sta-progress-stripe{position:absolute;bottom:0;left:0;width:100%;height:4px;background-size:40px 4px;
  background-image:repeating-linear-gradient(45deg,rgba(0,0,0,.15),rgba(0,0,0,.15) 10px,rgba(0,0,0,.3) 10px,rgba(0,0,0,.3) 20px);
  animation:sta-stripe 1s linear infinite}
@keyframes sta-stripe{0%{background-position:0 0}100%{background-position:40px 0}}
.sta-badge{display:inline-block;min-width:1.5em;padding:0 .4em;border-radius:1em;text-align:center;
  font-size:.75em;background:#222;color:#fff}
`;

export function injectStyles() {
    if (document.getElementById('sta-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'sta-styles';
    style.textContent = CSS;
    document.head.prepend(style);
}
