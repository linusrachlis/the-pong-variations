export const random_bool = (): boolean => Math.round(Math.random()) == 1

export const hypot = (x: number, y: number): number => {
    return Math.sqrt(x * x + y * y)
}
