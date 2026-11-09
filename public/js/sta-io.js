stateTagApp.commands = {
    setEventContext: function (context) {
        stateTagApp.$write('sta.context', context);
        return stateTagApp.$read('sta.context');
    },

    getEventContext: function () {
        return stateTagApp.$read('sta.context');
    },

    clear: function (branch) {
        stateTagApp.reset(branch);
    },

    showDemoModal: function () {
        stateTagApp.showModal('demo-modal', '<p>Tags work inside the modal body:</p><x-input locus="msg.en" name="greeting"></x-input>');
    },

    showModalError: function () {
        stateTagApp.showModal('demo-modal', 'This modal will show an error for 5 seconds.');
        stateTagApp.modalError('Something went wrong (this clears itself).');
    },

    // Undoable request: the GET waits stateTagApp.undoDelay seconds; <x-undo> can cancel it.
    loadHelloWithUndo: function () {
        stateTagApp.$write('hello', 'waiting (click undo to cancel)…');
        stateTagApp.$api(stateTagApp.endPoints.helloWorld, {caller: 'HelloWithUndo', undo: true})
            .then(function (response) {
                stateTagApp.$write('hello', response.data.en);
            })
            .catch(function (error) {
                stateTagApp.$write('hello', error.name === 'UndoError' ? 'cancelled by undo' : error.message);
            });
    }
};

// Receives validated STA messages addressed to this namespace (including our own broadcasts
// when the page is not embedded). Respond to STA events here.
stateTagApp.onMessage = function (staMessage) {
    stateTagApp.log(staMessage);
};
