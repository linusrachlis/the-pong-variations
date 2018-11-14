import Pong from "./pong"
import Paddle from "./paddle"
import Input from "./input"

const enum Axis { X, Y }
const enum AxisInput { MINUS, PLUS, STOP }

export default class AI implements Input {
    static readonly puck_y_distance_threshold = 40;

    static readonly move_request_thresholds = {
        [Axis.X]: 50,
        [Axis.Y]: 10,
    };

    private last_inputs = {
        [Axis.X]: AxisInput.STOP,
        [Axis.Y]: AxisInput.STOP,
    };
    private input_counters = {
        [Axis.X]: 0,
        [Axis.Y]: 0,
    };

    private x_axis_input_cycle = [
        AxisInput.MINUS,
        AxisInput.STOP,
        AxisInput.PLUS,
        AxisInput.STOP,
    ];
    private current_x_axis_input = 0;

    tick(paddle: Paddle, pong: Pong): void {
        const puck = pong.puck;

        // Alpha AI for X axis movement: just cycle between
        // left, stop, right, stop
        const input_accepted = this.input_debounce(
            Axis.X, paddle, this.x_axis_input_cycle[this.current_x_axis_input]);
        if (input_accepted) {
            this.current_x_axis_input = (this.current_x_axis_input + 1) % 4;
        }

        // Only care if puck is approaching
        if (
            ((puck.center_x < paddle.center_x) && (puck.vel.x <= 0)) ||
            ((puck.center_x > paddle.center_x) && (puck.vel.x >= 0))
        ) {
            this.input_debounce(Axis.Y, paddle, AxisInput.STOP);
            return;
        }

        const y_distance_to_puck = pong.puck.center_y - paddle.center_y;
        if (y_distance_to_puck >= AI.puck_y_distance_threshold) {
            this.input_debounce(Axis.Y, paddle, AxisInput.PLUS);
        } else if (y_distance_to_puck <= -AI.puck_y_distance_threshold) {
            this.input_debounce(Axis.Y, paddle, AxisInput.MINUS);
        } else {
            this.input_debounce(Axis.Y, paddle, AxisInput.STOP);
        }
    }

    /**
    @return boolean Whether this resulted in actually moving
    */
    private input_debounce(axis: Axis, paddle: Paddle, input: AxisInput): boolean {
        if (input == this.last_inputs[axis]) {
            this.input_counters[axis]++;
            if (this.input_counters[axis] >= AI.move_request_thresholds[axis]) {
                switch (axis) {
                    case Axis.X: {
                        paddle.moving_left = (input == AxisInput.MINUS);
                        paddle.moving_right = (input == AxisInput.PLUS);
                    } break;
                    case Axis.Y: {
                        paddle.moving_up = (input == AxisInput.MINUS);
                        paddle.moving_down = (input == AxisInput.PLUS);
                    } break;
                }
                this.input_counters[axis] = 0;
                return true;
            }
        } else {
            this.last_inputs[axis] = input;
            this.input_counters[axis] = 1;
        }
        return false;
    }
}
