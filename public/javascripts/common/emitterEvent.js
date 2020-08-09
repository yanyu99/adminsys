var events = require("events");

var emitterEvent = function() {
    if(this.eventEmitter === undefined) {
        this.emitterEvent = new events.EventEmitter();
    }
}

emitterEvent.prototype.getInstance = function() {
	return this.emitterEvent;
}

emitterEvent.prototype.on = function(events, listener) {
    this.emitterEvent.on(events, listener);
}

module.exports = new emitterEvent();