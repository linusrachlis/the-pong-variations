class Velocity {
    constructor(
        public x: number,
        public y: number,
        public readonly r: number
    ) { }

    static random_with_r(r: number): Velocity {
        const angle = Math.random() * 2 * Math.PI;
        const x = Math.cos(angle) * r;
        if (x == 0) {
            // TODO prevent it from being too vertical
            // e.g. rand too near .25 or .75
            console.error("vel.x = 0!");
        }
        const y = Math.sin(angle) * r;
        return new Velocity(x, y, r);
    }

    bend_up(bend_factor: number): void {
        this.bend_toward(-Math.PI/2, bend_factor);
    }

    bend_down(bend_factor: number): void {
        this.bend_toward(Math.PI/2, bend_factor);
    }

    /**
    @param target_angle radians
    @param bend_factor 0.0 = keep current angle, 1.0 = assume target angle
    */
    bend_toward(target_angle: number, bend_factor: number): void {
        const current_angle = Math.asin(this.y / this.r);
        const range_to_add = target_angle - current_angle;
        let new_angle = current_angle + (bend_factor * range_to_add);

        if (this.x < 0) {
            // In the above process we lost the X direction, so flip it
            // back if it's going to the left.
            new_angle = Math.PI - new_angle
        }

        this.x = Math.cos(new_angle) * this.r;
        this.y = Math.sin(new_angle) * this.r;
    }
}

class Paddle {
    constructor(
        public left: number,
        public top: number,
        public width: number,
        public height: number,
    ) { }

    get right(): number { return this.left + this.width; }
    get bottom(): number { return this.top + this.height; }

    moving_down = false;
    moving_up = false;

    static readonly move_speed = 3;

    bounce(puck: Puck): void {
        // Is the puck touching or overlapping this paddle at all?
        if (
            (puck.left <= this.right) &&
            (puck.right >= this.left) &&
            (puck.top <= this.bottom) &&
            (puck.bottom >= this.top)
        ) {
            let x_overlap: number,
                y_overlap: number,
                x_teleport: number,
                y_teleport: number,
                bend_up_factor: number | undefined,
                bend_down_factor: number | undefined;

            const right_overlap = this.right - puck.left;
            const left_overlap = puck.right - this.left;

            // Is the puck at the paddle's left or right edge?
            // The answer is whichever overlap is lesser.
            if (right_overlap < left_overlap) {
                x_teleport = this.right;
                x_overlap = right_overlap;
            } else {
                x_teleport = this.left - puck.width;
                x_overlap = left_overlap;
            }

            const bottom_overlap = this.bottom - puck.top;
            const top_overlap = puck.bottom - this.top;

            // Is the puck at the paddle's top or bottom edge?
            // Again, it's edge with the lesser overlap.
            if (bottom_overlap < top_overlap) {
                y_teleport = this.bottom;
                y_overlap = bottom_overlap;

                if (bottom_overlap < puck.height) {
                    // When puck is just off the paddle's bottom, angle it
                    // downwards in proportion to how little of it is overlapping.
                    bend_down_factor = 1 - (bottom_overlap / puck.height);
                }
            } else {
                y_teleport = this.top - puck.height;
                y_overlap = top_overlap;

                if (top_overlap < puck.height) {
                    // When puck is just off the paddle's TOP, angle it
                    // UPwards in proportion to how little of it is overlapping.
                    bend_up_factor = 1 - (top_overlap / puck.height);
                }
            }

            // Is the puck hitting a vertical or horizontal edge?
            // Take the lesser of the overlap results from above to find out.
            //
            // Note: if they're equal, both axes get reversed,
            // because the puck is exactly hitting a corner!
            //
            // Also, move the puck to line up exactly with the edge it's
            // bouncing off, so the paddle appears to push it if it's moving.
            // (This also avoids the problem of the puck getting stuck inside
            // the paddle in a bouncing loop.)
            if (x_overlap <= y_overlap) {
                puck.left = x_teleport;
                puck.vel.x *= -1;

                if (bend_up_factor !== undefined) {
                    puck.vel.bend_up(bend_up_factor);
                }
                else if (bend_down_factor !== undefined) {
                    puck.vel.bend_down(bend_down_factor);
                }
            }
            else if (x_overlap >= y_overlap) {
                puck.top = y_teleport;
                puck.vel.y *= -1;
            }
        }
    }

    tick(): void {
        if (this.moving_down) this.top += Paddle.move_speed;
        if (this.moving_up) this.top -= Paddle.move_speed;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.left, this.top, this.width, this.height);
    }
}

class Puck {
    vel: Velocity;

    get right(): number { return this.left + this.width; }
    get bottom(): number { return this.top + this.height; }

    constructor(
        public width: number, public height: number,
        public left: number, public top: number,
        speed: number
    ) {
        // Calculate random initial vector with given speed.
        this.vel = Velocity.random_with_r(speed);
    }

    tick(): void {
        this.left += this.vel.x;
        this.top += this.vel.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "magenta";
        ctx.fillRect(
            Math.round(this.left),
            Math.round(this.top),
            Math.round(this.width),
            Math.round(this.height)
        );
    }
}

class Pong {
    puck: Puck;
    paddle_l: Paddle;
    paddle_r: Paddle;

    constructor(
        public width: number,
        public height: number,
        public game_over: () => void
    ) {
        const half_width = Math.floor(width / 2),
            half_height = Math.floor(height / 2);

        const puck_width = 20, puck_height = 20,
            puck_y = half_height - Math.round(puck_height / 2);
        this.puck = new Puck(
            puck_width, puck_height,
            half_width, half_height, 3);

        const paddle_width = 20, paddle_height = 100,
            paddle_y = half_height - Math.round(paddle_height / 2);
        this.paddle_l = new Paddle(0, paddle_y, paddle_width, paddle_height);
        this.paddle_r = new Paddle(
            width - paddle_width, paddle_y, paddle_width, paddle_height);
    }

    tick(): void {
        this.puck.tick();
        this.paddle_l.tick();
        this.paddle_r.tick();

        // Paddle/puck collision check
        this.paddle_l.bounce(this.puck);
        this.paddle_r.bounce(this.puck);

        // TODO don't reverse vel multiple times in single tick

        // Puck/ceiling or puck/floor collision check
        if (this.puck.left <= 0 || this.puck.right >= this.width) {
            this.puck.vel.x *= -1;
        }
        if (this.puck.top <= 0 || this.puck.bottom >= this.height) {
            this.puck.vel.y *= -1;
        }

        // Puck/wall collision check (victory condition)
        if (this.puck.left <= 0 || this.puck.right >= this.width) {
            this.game_over();
        }
    }
}

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

    // TODO bounce angling
    // TODO use separate source files for classes
    // TODO disallow moving paddles off-screen
    // TODO paint game over text on canvas
    // TODO implement intentional grabbing
    // TODO or "tractor beam"?
    // TODO sound fx
    // TODO lock physics while painting?
});

const log = console.log;
const random_bool = (): boolean => Math.round(Math.random()) == 1;
