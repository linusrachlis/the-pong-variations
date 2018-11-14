import Paddle from "./paddle";
import Pong from "./pong";

export default interface Input {
    tick(paddle: Paddle, pong: Pong): void;
}
