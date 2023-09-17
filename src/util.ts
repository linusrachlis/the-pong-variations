export const random_bool = (): boolean => Math.round(Math.random()) == 1
export const paint_text = (
    ctx: CanvasRenderingContext2D,
    text: string,
    style: string,
    x: number,
    y: number
): void => {
    ctx.font = style
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText(text, x, y)
}
