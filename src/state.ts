import { PlayerSide } from './enums'
import { InputMap } from './input'
import { Velocity } from './velocity'

export class GameMode {
    grabbing = false
    magnetic = false
}

export class GameState {
    paddles: Record<PlayerSide, Paddle>
    is_over = false

    constructor(
        public game_mode: GameMode,
        public width: number,
        public height: number,
        public inputs: InputMap,
        public puck: Puck,
        public paddle_l: Paddle,
        public paddle_r: Paddle,
        public center_x: number,
        public center_y: number
    ) {
        this.paddles = {
            [PlayerSide.LEFT]: paddle_l,
            [PlayerSide.RIGHT]: paddle_r,
        }
    }
}

export class Paddle {
    static readonly pull_force = 0.1
    static readonly move_speed = 3 // should maybe be 2 in magnetic mode?

    public left_boundary = 0
    public right_boundary = 0

    public moving_down = false
    public moving_up = false
    public moving_left = false
    public moving_right = false
    public trying_to_grab = false

    constructor(
        public left: number,
        public top: number,
        public width: number,
        public height: number
    ) {}

    get right(): number {
        return this.left + this.width
    }

    get bottom(): number {
        return this.top + this.height
    }

    get center_x(): number {
        return this.left + this.width / 2
    }

    get center_y(): number {
        return this.top + this.height / 2
    }
}

export class Puck {
    grabbed_by: Paddle | undefined

    get right(): number {
        return this.left + this.width
    }
    get bottom(): number {
        return this.top + this.height
    }
    get center_x(): number {
        return this.left + this.width / 2
    }
    get center_y(): number {
        return this.top + this.height / 2
    }

    constructor(
        public width: number,
        public height: number,
        public left: number,
        public top: number,
        public vel: Velocity
    ) {}
}
