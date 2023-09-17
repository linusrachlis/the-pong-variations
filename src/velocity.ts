import * as util from './util'

export default class Velocity {
    constructor(
        public x: number,
        public y: number,
        public readonly r: number
    ) {}

    static random_with_r(r: number): Velocity {
        let angle = -Math.PI / 4 + (Math.PI / 2) * Math.random()
        if (util.random_bool()) {
            // 50% chance of going to the left
            angle += Math.PI
        }
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        return new Velocity(x, y, r)
    }

    bend_up(bend_factor: number): void {
        this.bend_toward(-Math.PI / 2, bend_factor * 0.75)
    }

    bend_down(bend_factor: number): void {
        this.bend_toward(Math.PI / 2, bend_factor * 0.75)
    }

    /**
    @param target_angle radians
    @param bend_factor 0.0 = keep current angle, 1.0 = assume target angle
    */
    bend_toward(target_angle: number, bend_factor: number): void {
        const current_angle = Math.asin(this.y / this.r)
        const range_to_add = target_angle - current_angle
        let new_angle = current_angle + bend_factor * range_to_add

        if (this.x < 0) {
            // In the above process we lost the X direction, so flip it
            // back if it's going to the left.
            new_angle = Math.PI - new_angle
        }

        this.x = Math.cos(new_angle) * this.r
        this.y = Math.sin(new_angle) * this.r
    }
}
