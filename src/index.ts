import AI from "./ai";
import { PlayerInput, PlayerSide } from "./enums";
import Input from "./input";
import HumanInput from "./human_input";
import Pong from "./pong";

window.addEventListener('load', () => {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas not supported");
        return;
    }
    const tick_length = 1000 / 60;

    let pong: Pong | undefined;

    const human_input_l = new HumanInput();
    const human_input_r = new HumanInput();
    // TODO see if it's possible to strictly type the key while targeting es5
    const human_inputs: { [key: string]: HumanInput } = {
        [PlayerSide.LEFT]: human_input_l,
        [PlayerSide.RIGHT]: human_input_r
    };

    const player_inputs: { [key: string]: Input } = {
        [PlayerSide.LEFT]: human_input_l,
        [PlayerSide.RIGHT]: new AI()
    };

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
        pong = new Pong(
            canvas.width, canvas.height,
            player_inputs[PlayerSide.LEFT],
            player_inputs[PlayerSide.RIGHT]);
        tick_interval = window.setInterval(tick, tick_length);
        window.requestAnimationFrame(paint);
    };
    new_game();

    const handle_key_event = (e: KeyboardEvent): void => {
        if (pong === undefined) return;

        switch (e.key) {
            // Movement
            case 'w': {
                human_input_l.moving_up = (e.type == "keydown");
            } break;
            case 'a': {
                human_input_l.moving_left = (e.type == "keydown");
            } break;
            case 's': {
                human_input_l.moving_down = (e.type == "keydown");
            } break;
            case 'd': {
                human_input_l.moving_right = (e.type == "keydown");
            } break;

            case "ArrowUp": {
                human_input_r.moving_up = (e.type == "keydown");
            } break;
            case "ArrowLeft": {
                human_input_r.moving_left = (e.type == "keydown");
            } break;
            case "ArrowDown": {
                human_input_r.moving_down = (e.type == "keydown");
            } break;
            case "ArrowRight": {
                human_input_r.moving_right = (e.type == "keydown");
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
    window.addEventListener("click", (e: MouseEvent) => {
        if (
            e.target && (e.target instanceof HTMLElement) &&
            e.target.matches("button.mode_switch")
        ) {
            const sidebar = <Element>e.target.closest(".sidebar");
            const help_panel = <Element>sidebar.querySelector(".help");
            const ai_panel = <Element>sidebar.querySelector(".ai_panel");
            const side = <PlayerSide>e.target.dataset.side;

            switch (e.target.dataset.to) {
                case PlayerInput.AI: {
                    help_panel.classList.add("hidden_panel");
                    ai_panel.classList.remove("hidden_panel");
                    player_inputs[side] = new AI();
                } break;
                case PlayerInput.HUMAN: {
                    ai_panel.classList.add("hidden_panel");
                    help_panel.classList.remove("hidden_panel");
                    player_inputs[side] = human_inputs[side];
                } break;
            }

            if (pong !== undefined && !pong.is_over) {
                // Hot-swap input
                pong.paddles[side].input = player_inputs[side];
            }
        }
    });

    // TODO better bounce angling
    // - just base the angle on Y distance from paddle's centre
    // - actually cap how vertical it can get
    // TODO or "tractor beam"?
    // TODO sound fx
    // TODO lock physics while painting?
    // TODO touch screen controls
});
