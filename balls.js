class Ball {
    constructor(canvas, x, y, radius, fill, stroke) {
        this.canvas = canvas
        this.context = this.canvas.Context
        this.x = x
        this.y = y
        this.dx = 20 * (0.5 - Math.random())
        this.dy = 0
        this.radius = radius
        this.fill = fill
        this.stroke = stroke
    }

    draw() {
        this.context.fillStyle = this.fill
        this.context.strokeStyle = this.stroke
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.context.closePath()
        this.context.fill()
        this.context.stroke()
    }

    action() {
        var attenuation = 1 - this.radius * 1e-3 // 半径が小さいほど跳ねやすい。

        this.x = (Math.abs(this.dx) < 1e-50) ? this.x : this.x + this.dx
        this.y = (Math.abs(this.dy) < 1e-50) ? this.y : this.y + this.dy

        // 壁に跳ね返る。
        if ((this.x - this.radius) < 0 || this.canvas.Width < (this.x + this.radius)) {
            this.dx = -this.dx * attenuation
            this.dy *= attenuation
            this.x = clamp(this.x, this.radius, this.canvas.Width - this.radius)
        }

        //画面の上下で跳ね返る。
        if ((this.y - this.radius) < 0 || this.canvas.Height < (this.y + this.radius)) {
            this.dx *= attenuation
            this.dy = -this.dy * attenuation
            this.y = clamp(this.y, this.radius, this.canvas.Height - this.radius)
        }

        // 下に落ちる。
        this.dy += gravity
    }

    bump() {
        this.dx += 48 * (0.5 - Math.random())
        this.dy = - Math.abs(this.dy) - 24 * Math.random()
    }

    hitTest(ball) {
        var dx = this.x - ball.x,
            dy = this.y - ball.y,
            distance = Math.sqrt(dx * dx + dy * dy),
            sumradius = this.radius + ball.radius,
            diff, nx, ny, ratiothis, ratioball, dnx, dny,
            sumdot, sdnx, sdny, rb, rt

        if (distance < sumradius) {
            diff = sumradius - distance

            nx = dx / distance
            ny = dy / distance
            ratiothis = this.radius / sumradius
            ratioball = 1 - ratiothis

            dnx = diff * nx
            dny = diff * ny

            this.x += dnx * ratioball
            this.y += dny * ratioball
            ball.x -= dnx * ratiothis
            ball.y -= dny * ratiothis

            sumdot = (ball.dx - this.dx) * nx + (ball.dy - this.dy) * ny
            sdnx = sumdot * nx
            sdny = sumdot * ny
            rb = ratioball * 1.92
            rt = ratiothis * 1.92

            this.dx += sdnx * rb
            this.dy += sdny * rb
            ball.dx -= sdnx * rt
            ball.dy -= sdny * rt
        }
    }
}

window.addEventListener("resize", resizeWindow, false)

var cv = new Canvas(window.innerWidth, 512)
cv.Element.addEventListener("click", onClickCanvas, false)
var blue = false

const NUM_BALL = 128
var gravity = 0.1
var balls = []

createBalls()
animate()

function createBalls() {
    var i = 0
    for (; i < NUM_BALL; ++i) {
        balls.push(new Ball(
            cv,
            Math.random() * cv.Width,
            Math.random() * cv.Height,
            8 + 8 * randomPow(4),
            randomColorCode(),
            "#111111"
        ))
    }
}

function animate() {
    updateCanvas()
    hitTest()
    action()
    requestAnimationFrame(animate)
}

// 全てのオブジェクトの組の衝突をチェックする素朴な方法。
function hitTest() {
    var i, j
    for (i = 0; i < balls.length; ++i) {
        for (j = i + 1; j < balls.length; ++j) {
            balls[i].hitTest(balls[j])
        }
    }
}

function action() {
    var i = 0
    for (; i < balls.length; ++i) {
        balls[i].action()
    }
}

function bump() {
    var i = 0
    for (; i < NUM_BALL; ++i) {
        balls[i].bump()
    }
}

function updateCanvas() {
    cv.clearWhite()
    drawBalls()
}

function drawBalls() {
    var i = 0
    for (; i < balls.length; ++i) {
        balls[i].draw()
    }
}

// ランダムなカラーコードを生成。
// 少し明るめの色。
function randomColorCode() {
    return "#" + ("00000" + Math.floor(0x888880 * (1 + Math.random())).toString(16)).slice(-6)
}

// value を [min, max] の範囲に収める。
function clamp(value, min, max) {
    return isNaN(value) ? 0 : Math.max(min, Math.min(value, max));
}

function randomPow(n) {
    var r = Math.random()
    return Math.pow(r, n)
}

function swap(a, b) {
    var temp = a
    a = b
    b = temp
}

// UI //

function resizeWindow(event) {
    cv.Element.width = window.innerWidth
}

function onClickCanvas() {
    bump()
}

function onInputNumberGravity(value) {
    gravity = parseFloat(value)
}