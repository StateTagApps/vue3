// The modal is state: sta.modal = {header, body, error, options}. <x-modal> renders it.
// The body may be text or an HTML string of tags ('<x-login></x-login>') — registered tags upgrade wherever they appear.
const ERROR_CLEAR_MS = 5000;

const closed = () => ({
    header: '',
    body: '',
    error: '',
    options: {x: true, backdrop: true, keyboard: true}
});

export function installModal(sta, {read, write}) {
    write('sta.modal', closed());

    sta.showModal = (header, body, options = {}) => {
        write('sta.modal', {...closed(), header, body, options: {...closed().options, ...options}});
    };

    sta.hideModal = () => {
        write('sta.modal', closed());
    };

    sta.modalError = message => {
        write('sta.modal.error', message);
        setTimeout(() => {
            if (read('sta.modal.error') === message) {
                write('sta.modal.error', '');
            }
        }, ERROR_CLEAR_MS);
    };
}
