import Pong from "./pong"
import Paddle from "./paddle"

enum MoveDirection { UP, DOWN, STOP }

export default class AI {
    constructor(public pong: Pong, public paddle: Paddle) { }

    static readonly puck_y_distance_threshold = 50;
    static readonly move_request_threshold = 10;

    private last_requested_direction: MoveDirection | undefined;
    private move_request_counter = 0;

    tick(): void {
        // FIXME
        if (this.pong.puck.vel.x <= 0) {
            this.move_debounce(MoveDirection.STOP);
            return;
        }

        const y_distance_to_puck = this.pong.puck.center_y - this.paddle.center_y;
        if (y_distance_to_puck >= AI.puck_y_distance_threshold) {
            this.move_debounce(MoveDirection.DOWN);
        } else if (y_distance_to_puck <= -AI.puck_y_distance_threshold) {
            this.move_debounce(MoveDirection.UP);
        } else {
            this.move_debounce(MoveDirection.STOP);
        }
    }

    private move_debounce(direction: MoveDirection): void {
        if (direction == this.last_requested_direction) {
            this.move_request_counter++;
            if (this.move_request_counter >= AI.move_request_threshold) {
                this.paddle.moving_down = (direction == MoveDirection.DOWN);
                this.paddle.moving_up = (direction == MoveDirection.UP);
                this.move_request_counter = 0;
            }
        } else {
            this.last_requested_direction = direction;
            this.move_request_counter = 1;
        }
    }
}
