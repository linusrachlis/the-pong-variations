import Paddle from './paddle'
import Velocity from './velocity'

export default class Puck {
    vel: Velocity
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
        speed: number
    ) {
        // Calculate random initial vector with given speed.
        this.vel = Velocity.random_with_r(speed, speed * 1.5)
    }
}
