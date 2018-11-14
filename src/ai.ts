import Pong from "./pong"
import Paddle from "./paddle"
import Input from "./input"

const enum MoveDirection { UP, DOWN, STOP }

export default class AI implements Input {
    static readonly puck_y_distance_threshold = 40;
    static readonly move_request_threshold = 10;

    private last_requested_direction: MoveDirection | undefined;
    private move_request_counter = 0;

    tick(paddle: Paddle, pong: Pong): void {
        const puck = pong.puck;
        // Only care if puck is approaching
        if (
            ((puck.center_x < paddle.center_x) && (puck.vel.x <= 0)) ||
            ((puck.center_x > paddle.center_x) && (puck.vel.x >= 0))
        ) {
            this.move_debounce(paddle, MoveDirection.STOP);
            return;
        }

        const y_distance_to_puck = pong.puck.center_y - paddle.center_y;
        if (y_distance_to_puck >= AI.puck_y_distance_threshold) {
            this.move_debounce(paddle, MoveDirection.DOWN);
        } else if (y_distance_to_puck <= -AI.puck_y_distance_threshold) {
            this.move_debounce(paddle, MoveDirection.UP);
        } else {
            this.move_debounce(paddle, MoveDirection.STOP);
        }
    }

    private move_debounce(paddle: Paddle, direction: MoveDirection): void {
        if (direction == this.last_requested_direction) {
            this.move_request_counter++;
            if (this.move_request_counter >= AI.move_request_threshold) {
                paddle.moving_down = (direction == MoveDirection.DOWN);
                paddle.moving_up = (direction == MoveDirection.UP);
                this.move_request_counter = 0;
            }
        } else {
            this.last_requested_direction = direction;
            this.move_request_counter = 1;
        }
    }
}
