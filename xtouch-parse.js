module.exports = function(RED) {
  function XTouchParse(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function(msg) {

      var data;

      // Get the raw midi data
      if (msg.midi && Array.isArray(msg.midi.raw) && msg.midi.raw.length === 3) {
        data = msg.midi.raw;
      }
      else if (Array.isArray(msg.payload) && msg.payload.length === 3) {
        data = msg.payload;
      } else {
        node.error("XTouch: The message is probably not a midi message");
        return;
      }

      var topic;
      var value;

      var t = data[0];
      var c = data[1];
      var v = data[2];

      // Control Change
      if (t === 176) {
       
        // Fader Move 
        if (c >= 1 && c <= 8) {
          topic = "fader_move_"+c;
          value = v/127.0;
        } 

        // Main fader move
        else if (c === 9) {
          topic = "fader_move_main";
          value = v/127.0;
        }

        // Fader Touch
        else if (c >= 101 && c <= 108) {
          topic = "fader_touch_"+(c-100);
          value = v === 127;
        }

        // Main fader touch
        else if (c === 109) {
          topic = "fader_touch_main";
          value = v === 127;
        }

        // Knob Turn
        else if (c >= 10 && c <= 25) {
          topic = "knob_turn_"+(c-9);
          value = v/127.0;
        }


      // Note on and Note off
      } else if (t === 144 || t === 128) {

        value = v === 127;

        // Knob push
        if (c >= 0 && c <= 15) {
          topic = "knob_push_"+(c+1);
        }

        // Select button pressed
        else if (c >= 16 && c <= 39) {
          topic = "select_button_"+(c-15);
        }

        // Faders select button pressed
        else if (c >= 40 && c <= 47) {
          topic = "fader_select_button_"+(c-39);
        }

        // Main Fader select button pressed
        else if (c === 48) {
          topic = "fader_select_button_main";
        }

        // Media buttons
        else if (c >= 49 && c <= 54) {
          topic = [
            "rewind_button",
            "fast_forward_button",
            "loop_button",
            "record_button",
            "stop_button",
            "play_button"
          ][c - 49];
        }
      }

      // Send the message
      if (topic) {
        node.send({
          topic,
          payload: value
        });
      }

    });
  }

  RED.nodes.registerType("xtouch-parse", XTouchParse);
}