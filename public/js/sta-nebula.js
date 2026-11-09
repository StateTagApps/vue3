// Remote commands: run a command on the other instances in this nebula room.
// Gun syncs the latest value (not every event), so a command is "name|from|id|sentAt":
// receivers skip their own commands, duplicates, and anything sent before they booted.
stateTagApp.sendRemoteCommand = function (name) {
    stateTagApp.$nebula('remoteCommand', [name, stateTagApp.instanceId, stateTagApp.uuid(), Date.now()].join('|'));
};

function initGlobalNebulaWatchers() {
    var executed = {};

    stateTagApp.$onNebula('remoteCommand', function (value) {
        if (!value) {
            return;
        }

        var parts = String(value).split('|');
        var name = parts[0], from = parts[1], id = parts[2], sentAt = Number(parts[3]);

        if (from === stateTagApp.instanceId || executed[id] || sentAt < stateTagApp.bootedAt) {
            return;
        }
        executed[id] = true;

        if (typeof stateTagApp.commands[name] !== 'function') {
            stateTagApp.log('Unknown remote command: ' + name);
            return;
        }

        stateTagApp.commands[name]();
        stateTagApp.log('Remote command executed: ' + name);
    });
}
