module.exports = function(RED) {
  function XTouchMessage(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var regex = /^(fader|knob|select_button|fader_select_button)_(\d\d?|main)$/;
    var CCcode = 176;
    var NoteCode = 144;

    node.on('input', function(msg) {

      var code = 0;
      var id = 0;
      var floatValue = Math.max(0, Math.min(127, Math.round(parseFloat(msg.payload) * 127)))||0;
      var boolValue = msg.payload ? 1 : 0;
      var value = 0;

      var control = config.control;
      if (control === "topic") {
        control = msg.topic;
      }

      if (!control || typeof control !== "string") {
        node.error("XTouch: The string topic is required.");
        return;
      }

      var match = control.match(regex);
      if (match) {
        var kind = match[1];
        var number = (match[2] === "main") ? 9 : parseInt(match[2]);

        switch (kind) {
          case "fader":
            code = CCcode;
            id = number;
            value = floatValue;
            //node.error("FloatValue: "+msg.payload);
            break;
          case "knob":
            code = CCcode;
            id = number + 9;
            value = floatValue;
            break;
          case "select_button":
            code = NoteCode;
            id = number + 15;
            value = boolValue;
            break;
          case "fader_select_button":
            code = NoteCode;
            id = number + 39;
            value = boolValue;
            break;
        }
      } else {
        var index = [
          "rewind_button",
          "fast_forward_button",
          "loop_button",
          "record_button",
          "stop_button",
          "play_button"].indexOf(control);

        if (index === -1) {
          node.error("XTouch: The topic is not recognized as a valid control.");
          return;
        }

        code = NoteCode;
        id = index + 49;
        value = boolValue;
      }

      node.send({
        payload: [code, id, value]
      });

    });
  }

  RED.nodes.registerType("xtouch-message", XTouchMessage);
}