import Pong from "./pong";
import Paddle from "./paddle";
import Puck from "./puck";

window.addEventListener('load', () => {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas not supported");
        return;
    }

    const tick_length = 1000 / 60;
    let game_is_over = false;

    const pong = new Pong(canvas.width, canvas.height, () => {
        console.log("==============");
        console.log("GAME OVER!!!");
        console.log("==============");
        window.clearInterval(tick_interval);
        game_is_over = true;
    });

    const paint = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pong.paddle_l.draw(ctx);
        pong.paddle_r.draw(ctx);
        pong.puck.draw(ctx);

        if (!game_is_over) {
            window.requestAnimationFrame(paint);
        }
    };

    const tick_interval = window.setInterval(pong.tick.bind(pong), tick_length);
    window.requestAnimationFrame(paint);

    const handle_key_event = (e: KeyboardEvent, is_down: boolean): void => {
        switch (e.key) {
            case 'q': {
                pong.paddle_l.moving_up = is_down;
            } break;
            case 'a': {
                pong.paddle_l.moving_down = is_down;
            } break;
            case 'p': {
                pong.paddle_r.moving_up = is_down;
            } break;
            case 'l': {
                pong.paddle_r.moving_down = is_down;
            } break;
        }
    };

    window.addEventListener("keydown", e => {
        handle_key_event(e, true);
    });
    window.addEventListener("keyup", e => {
        handle_key_event(e, false);
    });

    // TODO better bounce angling? to actually cap how vertical it can get
    // TODO paint game over text on canvas
    // TODO implement intentional grabbing
    // TODO or "tractor beam"?
    // TODO sound fx
    // TODO lock physics while painting?
});
