import Pong from "./pong";
import Paddle from "./paddle";
import Puck from "./puck";
import * as util from "./util";

window.addEventListener('load', () => {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas not supported");
        return;
    }
    const tick_length = 1000 / 60;

    let pong: Pong | undefined;
    let tick_interval: number;

    const paint = () => {
        if (pong === undefined) return;
        pong.draw(ctx);
        if (!pong.is_over) window.requestAnimationFrame(paint);
    };

    const tick = () => {
        if (pong === undefined || pong.is_over) {
            clearInterval(tick_interval);
            return;
        }
        pong.tick();
    };

    const new_game = () => {
        if (pong !== undefined && pong.is_over) {
            pong = undefined;
        }
        if (pong !== undefined) {
            return; // Won't restart if exists and isn't over
        }
        pong = new Pong(canvas.width, canvas.height);
        tick_interval = window.setInterval(tick, tick_length);
        window.requestAnimationFrame(paint);
    };
    new_game();

    const handle_key_event = (e: KeyboardEvent): void => {
        if (pong === undefined) return;

        switch (e.key) {
            // Movement
            case 'q': {
                pong.paddle_l.moving_up = (e.type == "keydown");
            } break;
            case 'a': {
                pong.paddle_l.moving_down = (e.type == "keydown");
            } break;
            case 'p': {
                pong.paddle_r.moving_up = (e.type == "keydown");
            } break;
            case 'l': {
                pong.paddle_r.moving_down = (e.type == "keydown");
            } break;

            // Restart
            case ' ':
            case "Spacebar": {
                if (e.type == "keyup") new_game();
            } break;
        }
    };

    window.addEventListener("keydown", handle_key_event);
    window.addEventListener("keyup", handle_key_event);

    // TODO better bounce angling
    // - just base the angle on Y distance from paddle's centre
    // - actually cap how vertical it can get
    // TODO or "tractor beam"?
    // TODO sound fx
    // TODO lock physics while painting?
    // TODO touch screen controls
});
